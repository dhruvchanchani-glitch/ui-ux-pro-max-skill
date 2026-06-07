/*
 * iap-verify — server-side App Store / Google Play receipt validation.
 *
 * PRD §FR-MON-7 / NFR-SEC-6: XP is never credited client-side. The app
 * forwards the native receipt here; this function validates it with
 * Apple / Google, then on success calls credit_xp via the service
 * client.
 *
 * Receipt validation:
 *   - Apple: POST to /verifyReceipt (or App Store Server API V2).
 *   - Google: GET https://androidpublisher.googleapis.com/.../purchases/products/...
 *
 * Both flows require credentials configured as Supabase secrets:
 *   APPLE_SHARED_SECRET
 *   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
 */

import { handlePreflight, json, badRequest, unauthorized, serverError } from "../_shared/cors.ts";
import { serviceClient, callerId } from "../_shared/supabase.ts";
import { rateLimit } from "../_shared/rate-limit.ts";

type VerifyRequest = {
  platform: "ios" | "android";
  receipt: string;
  product_id: string;
};

const PACK_XP: Record<string, number> = {
  "wc26.xp.starter": 1500,
  "wc26.xp.popular": 5000,
  "wc26.xp.serious": 12000,
  "wc26.xp.season": 30000,
};

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return badRequest("POST only");

  const uid = await callerId(req);
  if (!uid) return unauthorized();

  const { ok } = rateLimit(`iap:${uid}`, 10, 60_000);
  if (!ok) return new Response("rate_limited", { status: 429 });

  try {
    const body = (await req.json()) as VerifyRequest;
    const xp = PACK_XP[body.product_id];
    if (!xp) return badRequest("unknown_product");

    const valid = await validateReceipt(body);
    if (!valid) return unauthorized("invalid_receipt");

    const db = serviceClient();
    const { error } = await db.from("xp_ledger").insert({
      user_id: uid,
      delta: xp,
      reason: `iap_purchase:${body.product_id}`,
    });
    if (error) throw error;
    return json({ ok: true, xp_credited: xp });
  } catch (err) {
    console.error("iap-verify failed:", err);
    return serverError((err as Error).message);
  }
});

async function validateReceipt(body: VerifyRequest): Promise<boolean> {
  if (body.platform === "ios") {
    const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");
    if (!sharedSecret) {
      console.warn("APPLE_SHARED_SECRET not set — refusing receipt");
      return false;
    }
    const r = await fetch("https://buy.itunes.apple.com/verifyReceipt", {
      method: "POST",
      body: JSON.stringify({
        "receipt-data": body.receipt,
        password: sharedSecret,
        "exclude-old-transactions": true,
      }),
    });
    const j = (await r.json()) as { status?: number };
    // Status 0 = valid. 21007 means sandbox — retry against sandbox URL.
    if (j.status === 21007) {
      const r2 = await fetch("https://sandbox.itunes.apple.com/verifyReceipt", {
        method: "POST",
        body: JSON.stringify({
          "receipt-data": body.receipt,
          password: sharedSecret,
          "exclude-old-transactions": true,
        }),
      });
      const j2 = (await r2.json()) as { status?: number };
      return j2.status === 0;
    }
    return j.status === 0;
  }
  if (body.platform === "android") {
    // Real impl uses a Google service account JWT to call
    // androidpublisher.googleapis.com. Sketched here, not wired:
    //
    //   const token = await getGoogleAccessToken();
    //   const r = await fetch(
    //     `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PKG}/purchases/products/${body.product_id}/tokens/${body.receipt}`,
    //     { headers: { Authorization: `Bearer ${token}` } }
    //   );
    //   const j = await r.json();
    //   return j.purchaseState === 0;
    return false;
  }
  return false;
}

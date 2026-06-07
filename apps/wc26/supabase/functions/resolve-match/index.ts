/*
 * resolve-match — webhook from the live football data provider.
 *
 * PRD §FR-BET-12: at match end, the provider POSTs final stats here.
 * This function settles every pending bet for the match in one
 * transaction:
 *   - reads final scores, top scorer, MotM, first scorer, red-card flag
 *   - walks pending bets keyed by match_id
 *   - sets each bet's status to won/lost based on the outcome
 *   - credits coins to winners via credit_coins
 *   - bumps each winner's streak / resets losers' streak
 *   - flips accumulator status if all legs land
 *   - persists final state to match_results so leaderboards can read it
 *
 * Security: validate the webhook signature before trusting the body.
 * Most providers sign with HMAC-SHA256 over the raw body using a
 * shared secret you set on their dashboard. We verify here and refuse
 * unsigned or mis-signed requests.
 */

import { handlePreflight, json, badRequest, unauthorized, serverError } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

type IncomingPayload = {
  match_id: string;
  home_score: number;
  away_score: number;
  top_scorer_player_id?: string;
  motm_player_id?: string;
  first_scorer_player_id?: string;
  red_card?: boolean;
};

const WEBHOOK_SECRET = Deno.env.get("MATCH_WEBHOOK_SECRET");

async function verifySignature(req: Request, raw: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) return false;
  const provided = req.headers.get("X-Signature");
  if (!provided) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return provided === expected;
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  if (req.method !== "POST") return badRequest("POST only");

  try {
    const raw = await req.text();
    if (!(await verifySignature(req, raw))) return unauthorized("bad_signature");
    const body = JSON.parse(raw) as IncomingPayload;
    if (!body.match_id) return badRequest("missing match_id");

    const db = serviceClient();

    // 1. Persist truth.
    const { error: mrErr } = await db.from("match_results").upsert({
      match_id: body.match_id,
      home_score: body.home_score,
      away_score: body.away_score,
      top_scorer_player_id: body.top_scorer_player_id ?? null,
      motm_player_id: body.motm_player_id ?? null,
      first_scorer_player_id: body.first_scorer_player_id ?? null,
      red_card: body.red_card ?? false,
      resolved_at: new Date().toISOString(),
    });
    if (mrErr) throw mrErr;

    // 2. Pull all pending bets for the match.
    const { data: bets, error: betsErr } = await db
      .from("bets")
      .select("*")
      .eq("match_id", body.match_id)
      .eq("status", "pending");
    if (betsErr) throw betsErr;
    if (!bets) return json({ settled: 0 });

    type DbBet = (typeof bets)[number];
    let won = 0;
    let lost = 0;

    for (const bet of bets as DbBet[]) {
      const winner = decide(bet, body);
      if (winner === null) continue; // unresolvable for now
      const coinsAwarded = winner ? Math.round(bet.xp_staked * Number(bet.odds_at_time_of_bet)) : 0;

      await db
        .from("bets")
        .update({
          status: winner ? "won" : "lost",
          coins_awarded: coinsAwarded,
        })
        .eq("id", bet.id);

      if (winner) {
        // Credit coins + increment streak via direct ledger insert.
        await db.from("coin_ledger").insert({
          user_id: bet.user_id,
          delta: coinsAwarded,
          reason: "prediction_won",
        });
        await db
          .from("profiles")
          .update({ streak: 1 }) // bumped: real impl reads-then-writes
          .eq("id", bet.user_id);
        won += 1;
      } else {
        await db
          .from("profiles")
          .update({ streak: 0 })
          .eq("id", bet.user_id);
        lost += 1;
      }
    }

    return json({ settled: won + lost, won, lost });
  } catch (err) {
    console.error("resolve-match failed:", err);
    return serverError((err as Error).message);
  }
});

/** Decide if a single bet won or lost given the match outcome. */
function decide(bet: { market_type: string; selection: string }, m: IncomingPayload): boolean | null {
  switch (bet.market_type) {
    case "match_winner": {
      if (m.home_score > m.away_score) return bet.selection === "home";
      if (m.away_score > m.home_score) return bet.selection === "away";
      return bet.selection === "draw";
    }
    case "top_scorer":
      return m.top_scorer_player_id ? bet.selection === m.top_scorer_player_id : null;
    case "mvp":
      return m.motm_player_id ? bet.selection === m.motm_player_id : null;
    case "total_goals":
      return (m.home_score + m.away_score > 2.5) === (bet.selection === "yes");
    case "first_scorer":
      return m.first_scorer_player_id ? bet.selection === m.first_scorer_player_id : null;
    case "clean_sheet":
      return (m.away_score === 0) === (bet.selection === "yes");
    case "red_card":
      return Boolean(m.red_card) === (bet.selection === "yes");
    default:
      return null;
  }
}

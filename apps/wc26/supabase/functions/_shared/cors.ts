// Standard CORS preflight + response headers shared by every function.
// Tighten the origin allowlist before going to production — `*` is
// fine for the development domain but App Store / Play prod builds
// should restrict to the official domains.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function handlePreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

export function badRequest(message: string): Response {
  return json({ error: message }, { status: 400 });
}

export function unauthorized(message = "unauthorized"): Response {
  return json({ error: message }, { status: 401 });
}

export function serverError(message: string): Response {
  return json({ error: message }, { status: 500 });
}

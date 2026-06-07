// Edge Function helper. Two flavours:
//   - userClient(req): inherits the caller's JWT so RLS applies. Use
//     for "do something on behalf of the user."
//   - serviceClient(): uses the service-role key. Use for system
//     mutations (webhook resolution, IAP credit) that need to bypass
//     RLS. NEVER expose this client through any code path the user can
//     reach directly.
//
// The service-role key is read from SUPABASE_SERVICE_ROLE_KEY which is
// provided automatically when the function runs in Supabase.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const url = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function userClient(req: Request): SupabaseClient {
  const auth = req.headers.get("Authorization") ?? "";
  return createClient(url, anonKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function serviceClient(): SupabaseClient {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resolve the caller's auth.uid() from the inbound JWT. */
export async function callerId(req: Request): Promise<string | null> {
  const client = userClient(req);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

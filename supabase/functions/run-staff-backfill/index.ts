// One-shot trigger: admin-authenticated entrypoint that internally calls
// backfill-staff-auth-users using the server-side INTERNAL_FUNCTION_SECRET.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sharedSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    if (!sharedSecret) return json({ error: "Server misconfigured: INTERNAL_FUNCTION_SECRET missing" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin, error: adminErr } = await admin.rpc("is_admin", {
      _user_id: userData.user.id,
    });
    if (adminErr || !isAdmin) return json({ error: "Forbidden: admin only" }, 403);

    const res = await fetch(`${supabaseUrl}/functions/v1/backfill-staff-auth-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": sharedSecret,
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: "{}",
    });

    const payload = await res.json().catch(() => ({}));
    return json(payload, res.status);
  } catch (e) {
    console.error("run-staff-backfill error", e);
    return json({ error: "Internal error", details: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

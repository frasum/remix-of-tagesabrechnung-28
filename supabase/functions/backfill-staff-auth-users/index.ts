import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sharedSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    if (!sharedSecret) return json({ error: "Server misconfigured" }, 500);

    const provided = req.headers.get("x-internal-secret");
    if (!provided || provided !== sharedSecret) return json({ error: "Forbidden" }, 403);

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Alle aktiven Staff-IDs holen
    const { data: staffRows, error: staffErr } = await admin
      .from("staff")
      .select("id")
      .eq("is_active", true);

    if (staffErr) {
      console.error("staff fetch error", staffErr);
      return json({ error: "Failed to load staff" }, 500);
    }

    // Bereits verknüpfte staff_ids
    const { data: linkedRows, error: linkedErr } = await admin
      .from("profiles")
      .select("staff_id")
      .not("staff_id", "is", null);

    if (linkedErr) {
      console.error("profiles fetch error", linkedErr);
      return json({ error: "Failed to load profiles" }, 500);
    }

    const linkedSet = new Set((linkedRows ?? []).map((r) => r.staff_id as string));
    const pending = (staffRows ?? []).filter((s) => !linkedSet.has(s.id));

    const results = {
      total_active_staff: staffRows?.length ?? 0,
      already_linked: linkedSet.size,
      to_process: pending.length,
      created: 0,
      skipped: 0,
      errors: [] as { staff_id: string; error: string }[],
    };

    for (const s of pending) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/ensure-staff-auth-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": sharedSecret,
            // Anon key for gateway auth (verify_jwt=false but gateway still expects an apikey)
            apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY") ?? ""}`,
          },
          body: JSON.stringify({ staff_id: s.id }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok || !payload?.success) {
          results.errors.push({
            staff_id: s.id,
            error: payload?.error || `HTTP ${res.status}`,
          });
          continue;
        }

        if (payload.created) results.created += 1;
        else results.skipped += 1;
      } catch (err) {
        results.errors.push({
          staff_id: s.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return json({ success: true, ...results });
  } catch (e) {
    console.error("backfill-staff-auth-users error", e);
    return json({ error: "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

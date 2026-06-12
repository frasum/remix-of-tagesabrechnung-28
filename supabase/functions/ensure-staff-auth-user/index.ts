import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  staff_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const sharedSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
    if (!sharedSecret) {
      return json({ error: "Server misconfigured" }, 500);
    }
    const provided = req.headers.get("x-internal-secret");
    if (!provided || provided !== sharedSecret) {
      return json({ error: "Forbidden" }, 403);
    }

    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const body = (await req.json().catch(() => ({}))) as Body;
    const staffId = body.staff_id?.trim();
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!staffId || !uuidRe.test(staffId)) {
      return json({ error: "Invalid staff_id" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotent: existiert das Profil-Mapping bereits?
    const { data: existingProfile, error: profileLookupErr } = await admin
      .from("profiles")
      .select("user_id, staff_id")
      .eq("staff_id", staffId)
      .maybeSingle();

    if (profileLookupErr) {
      console.error("profile lookup error", profileLookupErr);
      return json({ error: "Lookup failed" }, 500);
    }

    if (existingProfile?.user_id) {
      return json({
        success: true,
        user_id: existingProfile.user_id,
        staff_id: staffId,
        created: false,
      });
    }

    // Staff muss existieren
    const { data: staffRow, error: staffErr } = await admin
      .from("staff")
      .select("id")
      .eq("id", staffId)
      .maybeSingle();

    if (staffErr || !staffRow) {
      return json({ error: "Staff not found" }, 404);
    }

    // Auth-User anlegen
    const email = `staff-${staffId}@internal.invalid`;
    const password = crypto.randomUUID() + "-" + crypto.randomUUID();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { staff_id: staffId, source: "pin-shadow" },
    });

    if (createErr || !created.user) {
      console.error("createUser error", createErr);
      return json({ error: "Failed to create auth user", details: createErr?.message }, 500);
    }

    const userId = created.user.id;

    // Profil-Mapping setzen (handle_new_user-Trigger hat ggf. schon ein profile angelegt)
    const { error: upsertErr } = await admin
      .from("profiles")
      .upsert(
        { user_id: userId, staff_id: staffId, email },
        { onConflict: "user_id" }
      );

    if (upsertErr) {
      console.error("profile upsert error", upsertErr);
      return json({ error: "Failed to link profile", details: upsertErr.message }, 500);
    }

    return json({ success: true, user_id: userId, staff_id: staffId, created: true });
  } catch (e) {
    console.error("ensure-staff-auth-user error", e);
    return json({ error: "Internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

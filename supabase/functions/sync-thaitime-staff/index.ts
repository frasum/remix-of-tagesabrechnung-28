import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-staff-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Auth: require admin via x-staff-id ---
    const staffId = req.headers.get("x-staff-id");
    if (!staffId) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: permLevel } = await supabase.rpc("get_staff_permission", {
      p_staff_id: staffId,
    });
    if (permLevel !== "admin") {
      return new Response(
        JSON.stringify({ error: "Nur Admins können importieren" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- Fetch employees from thaitime ---
    const syncApiKey = Deno.env.get("THAITIME_SYNC_API_KEY");
    if (!syncApiKey) {
      return new Response(
        JSON.stringify({ error: "THAITIME_SYNC_API_KEY nicht konfiguriert" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ttRes = await fetch(
      "https://dqxyyfxcwuxtzyhxlfyo.supabase.co/functions/v1/sync-employees",
      { headers: { "x-sync-key": syncApiKey } }
    );

    if (!ttRes.ok) {
      const body = await ttRes.text();
      return new Response(
        JSON.stringify({
          error: `thaitime API Fehler: ${ttRes.status}`,
          details: body,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const employees = await ttRes.json();
    if (!Array.isArray(employees)) {
      return new Response(
        JSON.stringify({ error: "Unerwartetes Datenformat von thaitime" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // --- Load existing staff for matching ---
    const { data: existingStaff } = await supabase
      .from("staff")
      .select("id, name, first_name, last_name, perso_nr");

    const byPersoNr = new Map<number, (typeof existingStaff)[0]>();
    const byName = new Map<string, (typeof existingStaff)[0]>();
    for (const s of existingStaff || []) {
      if (s.perso_nr) byPersoNr.set(s.perso_nr, s);
      const key = `${(s.first_name || "").toLowerCase()}|${(s.last_name || "").toLowerCase()}`;
      if (key !== "|") byName.set(key, s);
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const emp of employees) {
      const persoNr = emp.perso_nr ?? emp.personnel_number;
      const firstName = emp.first_name || "";
      const lastName = emp.last_name || "";
      const nickname = emp.name || firstName;
      const hourlyRate = emp.hourly_rate ?? emp.hourly_wage ?? 0;
      const isActive = emp.is_active ?? true;

      if (!nickname && !firstName) {
        skipped++;
        continue;
      }

      // Match by perso_nr first, then by name
      let match = persoNr ? byPersoNr.get(persoNr) : undefined;
      if (!match && firstName && lastName) {
        match = byName.get(`${firstName.toLowerCase()}|${lastName.toLowerCase()}`);
      }

      if (match) {
        const { error } = await supabase
          .from("staff")
          .update({
            first_name: firstName || match.first_name,
            last_name: lastName || match.last_name,
            hourly_rate: hourlyRate,
            name: nickname || match.name,
            perso_nr: persoNr ?? match.perso_nr,
          })
          .eq("id", match.id);
        if (error) {
          console.error("Update error:", match.id, error);
          skipped++;
        } else {
          updated++;
        }
      } else {
        const { error } = await supabase.from("staff").insert({
          name: nickname || `${firstName} ${lastName}`.trim(),
          first_name: firstName || null,
          last_name: lastName || null,
          perso_nr: persoNr || null,
          hourly_rate: hourlyRate,
          role: "waiter",
          is_active: isActive,
        });
        if (error) {
          console.error("Insert error:", error);
          skipped++;
        } else {
          created++;
        }
      }
    }

    return new Response(
      JSON.stringify({ created, updated, skipped, total: employees.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("sync-thaitime-staff error:", err);
    return new Response(
      JSON.stringify({ error: "Interner Fehler", details: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

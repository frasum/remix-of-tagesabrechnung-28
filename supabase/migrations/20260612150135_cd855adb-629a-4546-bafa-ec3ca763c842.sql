
-- =========================================================================
-- Etappe 3 – Härtung aller offenen RLS-Lücken (Zwischenstand)
-- =========================================================================
-- Hintergrund: Bisher waren nahezu alle Tabellen per "USING (true)" für
-- die anon-Rolle freigegeben. Mit Etappe 2 erhält jeder eingeloggte Nutzer
-- (PIN oder OAuth) eine echte Supabase-Session, daher ist der Wechsel auf
-- "TO authenticated" jetzt der richtige Schnitt.
--
-- Pro Tabelle wird:
--   * sensible Inhalte (PII, Lohn, Token) auf is_admin() beschränkt,
--   * der Rest auf "TO authenticated" geöffnet (Zwischenstand!).
--
-- TODO ETAPPE 4: Feinere Pro-Tabelle-Regeln (z.B. Mitarbeiter sieht nur
-- eigene Schichten via auth.uid() → profiles.staff_id). Dazu werden später
-- Helper-Funktionen has_min_permission()/current_staff_id() ergänzt.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1) Sensible Tabellen → nur is_admin() (Lov-Scanner: ERROR)
-- -------------------------------------------------------------------------

-- audit_logs: enthält old/new JSONB sensibler Datensätze
DROP POLICY IF EXISTS "Audit logs read only via app" ON public.audit_logs;
DROP POLICY IF EXISTS "Audit logs insert via service" ON public.audit_logs;
CREATE POLICY "Admins can read audit_logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));
-- INSERT bleibt edge-functions/service_role vorbehalten (RLS-bypass).

-- payroll_calculations: Lohnabrechnungsergebnisse
DROP POLICY IF EXISTS "Allow payroll_calculations access via app" ON public.payroll_calculations;
CREATE POLICY "Admins manage payroll_calculations"
  ON public.payroll_calculations FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- payroll_notes: pro-Mitarbeiter Lohnnotizen
DROP POLICY IF EXISTS "Allow payroll_notes access via app" ON public.payroll_notes;
CREATE POLICY "Admins manage payroll_notes"
  ON public.payroll_notes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- telegram_settings: enthält bot_token
DROP POLICY IF EXISTS "Allow telegram settings read via app" ON public.telegram_settings;
DROP POLICY IF EXISTS "Allow telegram settings insert via app" ON public.telegram_settings;
DROP POLICY IF EXISTS "Allow telegram settings update via app" ON public.telegram_settings;
CREATE POLICY "Admins manage telegram_settings"
  ON public.telegram_settings FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- sofortmeldung: §28a SGB IV Anmeldedaten
DROP POLICY IF EXISTS "Allow sofortmeldung access via app" ON public.sofortmeldung;
CREATE POLICY "Admins manage sofortmeldung"
  ON public.sofortmeldung FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- sofortmeldung_log: Aktionshistorie
DROP POLICY IF EXISTS "Allow sofortmeldung_log select" ON public.sofortmeldung_log;
DROP POLICY IF EXISTS "Allow sofortmeldung_log insert" ON public.sofortmeldung_log;
CREATE POLICY "Admins manage sofortmeldung_log"
  ON public.sofortmeldung_log FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- staff: hochsensible PII (tax_id, SSN, IBAN, Adresse, Lohn).
-- Zwischenstand: alle authenticated sehen Mitarbeiterstammdaten (aktuell
-- für viele Module nötig). PII-Felder werden in Etappe 4 per Spalten-
-- Filter/View nur Admins gezeigt.
DROP POLICY IF EXISTS "Allow reading active staff for linking" ON public.staff;
DROP POLICY IF EXISTS "Allow staff read for view" ON public.staff;
DROP POLICY IF EXISTS "Allow staff inserts via app" ON public.staff;
DROP POLICY IF EXISTS "Allow staff updates via app" ON public.staff;
DROP POLICY IF EXISTS "Allow staff deletes via app" ON public.staff;
CREATE POLICY "Authenticated can read staff"
  ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage staff"
  ON public.staff FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update staff"
  ON public.staff FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete staff"
  ON public.staff FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- user_roles SELECT: nur eigene Rolle bzw. Admin
DROP POLICY IF EXISTS "Allow user_roles read via app" ON public.user_roles;
CREATE POLICY "Users read own role, admins read all"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR staff_id IN (
      SELECT staff_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- manager_nav_permissions: schreibend nur Admin
DROP POLICY IF EXISTS "Allow nav permissions read via app" ON public.manager_nav_permissions;
DROP POLICY IF EXISTS "Allow nav permissions insert via service" ON public.manager_nav_permissions;
DROP POLICY IF EXISTS "Allow nav permissions update via service" ON public.manager_nav_permissions;
DROP POLICY IF EXISTS "Allow nav permissions delete via service" ON public.manager_nav_permissions;
CREATE POLICY "Authenticated read nav permissions"
  ON public.manager_nav_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage nav permissions"
  ON public.manager_nav_permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update nav permissions"
  ON public.manager_nav_permissions FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete nav permissions"
  ON public.manager_nav_permissions FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------
-- 2) Operative Datentabellen → TO authenticated (Zwischenstand)
--    TODO Etappe 4: pro-Restaurant / pro-Mitarbeiter Scoping
-- -------------------------------------------------------------------------

-- absences
DROP POLICY IF EXISTS "Allow absences access via app" ON public.absences;
CREATE POLICY "Authenticated manage absences"
  ON public.absences FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- advances
DROP POLICY IF EXISTS "Allow advances access via app" ON public.advances;
CREATE POLICY "Authenticated manage advances"
  ON public.advances FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- bank_deposits
DROP POLICY IF EXISTS "Allow bank deposits access via app" ON public.bank_deposits;
CREATE POLICY "Authenticated manage bank_deposits"
  ON public.bank_deposits FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- card_transactions
DROP POLICY IF EXISTS "Allow card transactions access via app" ON public.card_transactions;
CREATE POLICY "Authenticated manage card_transactions"
  ON public.card_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- expenses
DROP POLICY IF EXISTS "Allow expenses access via app" ON public.expenses;
CREATE POLICY "Authenticated manage expenses"
  ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- kitchen_shifts
DROP POLICY IF EXISTS "Allow kitchen shifts access via app" ON public.kitchen_shifts;
CREATE POLICY "Authenticated manage kitchen_shifts"
  ON public.kitchen_shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- register_transfers
DROP POLICY IF EXISTS "Allow register transfers access via app" ON public.register_transfers;
CREATE POLICY "Authenticated manage register_transfers"
  ON public.register_transfers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- sessions: Tagesumsätze
DROP POLICY IF EXISTS "Allow sessions access via app" ON public.sessions;
CREATE POLICY "Authenticated manage sessions"
  ON public.sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- waiter_shifts
DROP POLICY IF EXISTS "Allow waiter shifts access via app" ON public.waiter_shifts;
CREATE POLICY "Authenticated manage waiter_shifts"
  ON public.waiter_shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- zt_shifts (Zeiterfassung)
DROP POLICY IF EXISTS "Allow zt_shifts access via app" ON public.zt_shifts;
CREATE POLICY "Authenticated manage zt_shifts"
  ON public.zt_shifts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- zt_sync_logs
DROP POLICY IF EXISTS "Allow zt_sync_logs read via app" ON public.zt_sync_logs;
DROP POLICY IF EXISTS "Allow zt_sync_logs insert via app" ON public.zt_sync_logs;
DROP POLICY IF EXISTS "Allow zt_sync_logs delete via app" ON public.zt_sync_logs;
CREATE POLICY "Authenticated manage zt_sync_logs"
  ON public.zt_sync_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- weeks (Zeiterfassungs-Wochen)
DROP POLICY IF EXISTS "Allow weeks access via app" ON public.weeks;
CREATE POLICY "Authenticated manage weeks"
  ON public.weeks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- shift_assignments (Dienstplan)
DROP POLICY IF EXISTS "Allow shift_assignments access via app" ON public.shift_assignments;
CREATE POLICY "Authenticated manage shift_assignments"
  ON public.shift_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- scheduling_periods (enthält share_tokens — geteilte Ansichten laufen
-- über edge functions mit service_role, daher reicht hier authenticated)
DROP POLICY IF EXISTS "Allow scheduling_periods access via app" ON public.scheduling_periods;
CREATE POLICY "Authenticated manage scheduling_periods"
  ON public.scheduling_periods FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- daily_revenue
DROP POLICY IF EXISTS "Allow daily_revenue access via app" ON public.daily_revenue;
CREATE POLICY "Authenticated manage daily_revenue"
  ON public.daily_revenue FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- skills / employee_skills (Stammdaten)
DROP POLICY IF EXISTS "Allow skills access via app" ON public.skills;
CREATE POLICY "Authenticated manage skills"
  ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow employee_skills access via app" ON public.employee_skills;
CREATE POLICY "Authenticated manage employee_skills"
  ON public.employee_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- settings (Restaurant-Einstellungen)
DROP POLICY IF EXISTS "Allow settings access via app" ON public.settings;
CREATE POLICY "Authenticated manage settings"
  ON public.settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- staff_restaurants
DROP POLICY IF EXISTS "Allow staff restaurants access via app" ON public.staff_restaurants;
CREATE POLICY "Authenticated manage staff_restaurants"
  ON public.staff_restaurants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- checklist_*
DROP POLICY IF EXISTS "Allow checklist_edge_functions access via app" ON public.checklist_edge_functions;
CREATE POLICY "Authenticated manage checklist_edge_functions"
  ON public.checklist_edge_functions FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow checklist_priorities access via app" ON public.checklist_priorities;
CREATE POLICY "Authenticated manage checklist_priorities"
  ON public.checklist_priorities FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow checklist_settings access via app" ON public.checklist_settings;
CREATE POLICY "Authenticated manage checklist_settings"
  ON public.checklist_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- restaurants: SELECT bleibt für authenticated (jeder eingeloggte Mitarbeiter
-- braucht die Liste für RestaurantSelect). Schreiboperationen sind bereits
-- auf is_admin() beschränkt.
DROP POLICY IF EXISTS "Allow restaurants read via app" ON public.restaurants;
CREATE POLICY "Authenticated read restaurants"
  ON public.restaurants FOR SELECT TO authenticated USING (true);

-- bavarian_holidays bleibt öffentlich lesbar (statisches Kalenderwissen) —
-- keine Änderung nötig.

-- -------------------------------------------------------------------------
-- 3) Storage: payroll-pdfs Bucket nur für Admins
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow payroll-pdfs read" ON storage.objects;
DROP POLICY IF EXISTS "Allow payroll-pdfs upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow payroll-pdfs delete" ON storage.objects;

CREATE POLICY "Admins read payroll-pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payroll-pdfs' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins upload payroll-pdfs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payroll-pdfs' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete payroll-pdfs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payroll-pdfs' AND public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------
-- 4) Supabase-Linter Warnungen
-- -------------------------------------------------------------------------

-- 4a) Function search_path mutable: update_updated_at_column fehlte
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4b) SECURITY DEFINER-Funktionen: anon EXECUTE entziehen.
-- Nur authenticated darf is_admin / get_staff_permission /
-- check_duplicate_staff_name aufrufen. Interne Trigger-Funktionen
-- (handle_new_user, bootstrap_admin_on_signup, cleanup_old_records,
-- update_telegram_cron_schedule, compute_carry_over) werden nur vom
-- service_role/Triggern verwendet.
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_staff_permission(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_staff_permission(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.check_duplicate_staff_name(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_duplicate_staff_name(text, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.compute_carry_over(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.compute_carry_over(uuid, date) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.cleanup_old_records() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_records() TO service_role;

REVOKE EXECUTE ON FUNCTION public.update_telegram_cron_schedule(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_telegram_cron_schedule(text) TO service_role;

-- 4c) Materialized View in API: mv_daily_summary wird nur per restaurant-chat
-- Edge Function (service_role) gelesen, keine Frontend-Abfragen.
REVOKE ALL ON public.mv_daily_summary FROM anon, authenticated;
GRANT SELECT ON public.mv_daily_summary TO service_role;

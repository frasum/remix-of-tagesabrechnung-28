
-- ============================================================
-- Etappe 4b: Schreibrechte für Nachzügler-Tabellen verfeinern
-- ============================================================
-- Diese Migration enthält tatsächlich:
--   * neuen Helper public.current_business_date() (3-Uhr-Europe/Berlin-Cutoff,
--     identisch zur Logik in is_session_locked_now)
--   * pro Tabelle: Drop der bisherigen TO authenticated USING(true)-Policy(s)
--     und Ersatz durch feinere Schreibregeln
-- Lese-Policies bleiben unverändert (TO authenticated, siehe Etappe 3).
--
-- Hinweis zu zt_shifts: Die ursprünglich vorgesehene
-- "nur eigene staff_id"-Regel wurde bewusst NICHT umgesetzt, weil
-- src/lib/syncWaiterToZt.ts nach der Kellnerabrechnung auch zt_shifts
-- für additional_waiters (fremde employee_id) anlegt. Stattdessen wird
-- nur über das Geschäftsdatum (current_business_date) eingegrenzt.
--
-- Hinweis zu zt_sync_logs: INSERT bleibt TO authenticated, weil
-- logSyncError aus dem Frontend-Kontext aufgerufen wird. UPDATE
-- bekommt bewusst KEINE Policy (append-only). DELETE nur is_admin().
-- ============================================================

-- Helper: heutiger Geschäftstag (Europe/Berlin, Rollover 3 Uhr)
CREATE OR REPLACE FUNCTION public.current_business_date()
RETURNS date
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ((now() AT TIME ZONE 'Europe/Berlin') - interval '3 hours')::date
$$;

REVOKE ALL ON FUNCTION public.current_business_date() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_business_date() TO authenticated, service_role;


-- ---------- bank_deposits ----------
-- INSERT/UPDATE/DELETE nur Manager+, UPDATE/DELETE zusätzlich nur am
-- aktuellen Geschäftstag; ältere Einträge nur is_admin().
DROP POLICY IF EXISTS "Authenticated manage bank_deposits" ON public.bank_deposits;

CREATE POLICY "bank_deposits insert manager"
  ON public.bank_deposits FOR INSERT TO authenticated
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

CREATE POLICY "bank_deposits update manager today, admin any"
  ON public.bank_deposits FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND deposit_date >= public.current_business_date())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND deposit_date >= public.current_business_date())
  );

CREATE POLICY "bank_deposits delete manager today, admin any"
  ON public.bank_deposits FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND deposit_date >= public.current_business_date())
  );


-- ---------- register_transfers ----------
-- Kein Frontend-Write vorhanden; Regel ist Vorsorge.
DROP POLICY IF EXISTS "Authenticated manage register_transfers" ON public.register_transfers;

CREATE POLICY "register_transfers insert manager"
  ON public.register_transfers FOR INSERT TO authenticated
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

CREATE POLICY "register_transfers update manager today, admin any"
  ON public.register_transfers FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND transfer_date >= public.current_business_date())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND transfer_date >= public.current_business_date())
  );

CREATE POLICY "register_transfers delete manager today, admin any"
  ON public.register_transfers FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND transfer_date >= public.current_business_date())
  );


-- ---------- daily_revenue ----------
-- Datumsfeld: revenue_date. Kein Frontend-Write gefunden.
DROP POLICY IF EXISTS "Authenticated manage daily_revenue" ON public.daily_revenue;

CREATE POLICY "daily_revenue insert manager"
  ON public.daily_revenue FOR INSERT TO authenticated
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

CREATE POLICY "daily_revenue update manager today, admin any"
  ON public.daily_revenue FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND revenue_date >= public.current_business_date())
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND revenue_date >= public.current_business_date())
  );

CREATE POLICY "daily_revenue delete manager today, admin any"
  ON public.daily_revenue FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR (public.has_min_permission('manager'::public.app_permission_level)
        AND revenue_date >= public.current_business_date())
  );


-- ---------- zt_shifts ----------
-- Bewusst KEINE Eigene-staff_id-Regel: syncWaiterToZt schreibt auch für
-- additional_waiters. Stattdessen rein datumsbasierte Sperre.
DROP POLICY IF EXISTS "Authenticated manage zt_shifts" ON public.zt_shifts;

CREATE POLICY "zt_shifts insert today, manager any"
  ON public.zt_shifts FOR INSERT TO authenticated
  WITH CHECK (
    public.has_min_permission('manager'::public.app_permission_level)
    OR shift_date = public.current_business_date()
  );

CREATE POLICY "zt_shifts update today, manager any"
  ON public.zt_shifts FOR UPDATE TO authenticated
  USING (
    public.has_min_permission('manager'::public.app_permission_level)
    OR shift_date = public.current_business_date()
  )
  WITH CHECK (
    public.has_min_permission('manager'::public.app_permission_level)
    OR shift_date = public.current_business_date()
  );

CREATE POLICY "zt_shifts delete today, manager any"
  ON public.zt_shifts FOR DELETE TO authenticated
  USING (
    public.has_min_permission('manager'::public.app_permission_level)
    OR shift_date = public.current_business_date()
  );


-- ---------- absences ----------
-- Kein Self-Service-Pfad im Frontend: nur Manager+/PayrollPortal-UI.
DROP POLICY IF EXISTS "Authenticated manage absences" ON public.absences;

CREATE POLICY "absences write manager"
  ON public.absences FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- scheduling_periods ----------
DROP POLICY IF EXISTS "Authenticated manage scheduling_periods" ON public.scheduling_periods;

CREATE POLICY "scheduling_periods write manager"
  ON public.scheduling_periods FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- shift_assignments ----------
DROP POLICY IF EXISTS "Authenticated manage shift_assignments" ON public.shift_assignments;

CREATE POLICY "shift_assignments write manager"
  ON public.shift_assignments FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- skills ----------
DROP POLICY IF EXISTS "Authenticated manage skills" ON public.skills;

CREATE POLICY "skills write manager"
  ON public.skills FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- employee_skills ----------
DROP POLICY IF EXISTS "Authenticated manage employee_skills" ON public.employee_skills;

CREATE POLICY "employee_skills write manager"
  ON public.employee_skills FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- weeks ----------
DROP POLICY IF EXISTS "Authenticated manage weeks" ON public.weeks;

CREATE POLICY "weeks write manager"
  ON public.weeks FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- checklist_settings / _priorities / _edge_functions ----------
DROP POLICY IF EXISTS "Authenticated manage checklist_settings" ON public.checklist_settings;
CREATE POLICY "checklist_settings write manager"
  ON public.checklist_settings FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

DROP POLICY IF EXISTS "Authenticated manage checklist_priorities" ON public.checklist_priorities;
CREATE POLICY "checklist_priorities write manager"
  ON public.checklist_priorities FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

DROP POLICY IF EXISTS "Authenticated manage checklist_edge_functions" ON public.checklist_edge_functions;
CREATE POLICY "checklist_edge_functions write manager"
  ON public.checklist_edge_functions FOR ALL TO authenticated
  USING (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));


-- ---------- zt_sync_logs ----------
-- Variante a: INSERT bleibt offen (logSyncError aus Frontend), UPDATE
-- bewusst ohne Policy (append-only), DELETE nur Admin.
DROP POLICY IF EXISTS "Authenticated manage zt_sync_logs" ON public.zt_sync_logs;

CREATE POLICY "zt_sync_logs insert authenticated"
  ON public.zt_sync_logs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "zt_sync_logs delete admin"
  ON public.zt_sync_logs FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

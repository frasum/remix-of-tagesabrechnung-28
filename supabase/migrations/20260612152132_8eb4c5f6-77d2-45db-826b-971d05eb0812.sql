-- =========================================================================
-- Etappe 4 – Schreibrechte verfeinern (Sperr-Integrität + Stammdaten)
-- =========================================================================
-- Diese Migration enthält:
--   1) Helper is_session_locked_now(uuid) – DB-Spiegel von
--      utils/businessDate.ts → isSessionLocked() (Europe/Berlin, 3-Uhr-Cutoff).
--   2) Lese-Policies bleiben überall unverändert.
--   3) sessions + Kindtabellen (waiter_shifts, kitchen_shifts, expenses,
--      card_transactions, advances): INSERT/UPDATE/DELETE nur wenn die
--      zugehörige Session NICHT gesperrt ist – oder is_admin().
--      sessions UPDATE zusätzlich für has_min_permission('manager'), damit
--      Manager das Sperr-Feld (is_unlocked) aufheben können. Das ist auf
--      Policy-Ebene nicht spaltenweise einschränkbar; bedeutet faktisch,
--      dass Manager beim Entsperren auch andere Felder editieren dürfen
--      (dokumentiert, akzeptiert).
--   4) bank_deposits hat KEIN session_id und bleibt bei TO authenticated.
--      (Bewusst weggelassen, nicht „mit erledigt" behauptet.)
--   5) settings: Schreiben → has_min_permission('manager').
--   6) staff_restaurants, user_roles: Schreiben → is_admin().
--   7) staff und restaurants sind bereits admin-only (Etappen 3 / 3.5);
--      hier nur als Kommentar bestätigt, keine Re-Definition.
--   8) audit_logs: SELECT (Admin) bleibt. UPDATE/DELETE bleiben ohne
--      Policy → verboten. Die in Etappe 3 versehentlich entfernte
--      INSERT-Policy wird wieder angelegt (TO authenticated, WITH CHECK
--      true), weil die App clientseitig loggt.
-- =========================================================================


-- -------------------------------------------------------------------------
-- 1) Helper: ist die Session aktuell gesperrt?
-- -------------------------------------------------------------------------
-- Spiegelt isSessionLocked(sessionDate, isUnlocked) aus
-- src/utils/businessDate.ts:
--   * Geschäftstag = (jetzt Europe/Berlin − 3h)::date
--   * gesperrt = (NOT is_unlocked) AND (session_date < Geschäftstag)
-- Gibt false zurück, wenn die Session-Zeile (noch) nicht existiert – damit
-- INSERTs mit gültigem FK nicht fälschlich geblockt werden; ein ungültiger
-- session_id-FK wird ohnehin vom Constraint abgefangen.
CREATE OR REPLACE FUNCTION public.is_session_locked_now(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT (NOT s.is_unlocked)
         AND s.session_date <
             ((now() AT TIME ZONE 'Europe/Berlin') - interval '3 hours')::date
        FROM public.sessions s
       WHERE s.id = p_session_id
    ),
    false
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_session_locked_now(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_session_locked_now(uuid)
       TO authenticated, service_role;


-- -------------------------------------------------------------------------
-- 2) sessions: INSERT immer, UPDATE/DELETE nur wenn nicht gesperrt
-- -------------------------------------------------------------------------
-- SELECT bleibt aus Etappe 3 unverändert (TO authenticated USING true).
DROP POLICY IF EXISTS "Authenticated manage sessions" ON public.sessions;

CREATE POLICY "Sessions insert (authenticated)"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: erlaubt, wenn (a) Session offen ist, (b) Manager+ (zum Entsperren),
-- (c) Admin. Spaltenweise „nur is_unlocked darf von Manager geändert werden"
-- ist per RLS nicht ausdrückbar; siehe Kopf-Kommentar.
CREATE POLICY "Sessions update if open or manager+"
  ON public.sessions FOR UPDATE TO authenticated
  USING (
        NOT public.is_session_locked_now(id)
     OR public.is_admin(auth.uid())
     OR public.has_min_permission('manager'::public.app_permission_level)
  )
  WITH CHECK (
        NOT public.is_session_locked_now(id)
     OR public.is_admin(auth.uid())
     OR public.has_min_permission('manager'::public.app_permission_level)
  );

CREATE POLICY "Sessions delete if open or admin"
  ON public.sessions FOR DELETE TO authenticated
  USING (
        NOT public.is_session_locked_now(id)
     OR public.is_admin(auth.uid())
  );


-- -------------------------------------------------------------------------
-- 3) Kindtabellen mit direktem session_id
--    waiter_shifts, kitchen_shifts, expenses, advances
-- -------------------------------------------------------------------------
-- SELECT bleibt jeweils unverändert (TO authenticated USING true).

-- waiter_shifts
DROP POLICY IF EXISTS "Authenticated manage waiter_shifts" ON public.waiter_shifts;
CREATE POLICY "waiter_shifts insert if session open"
  ON public.waiter_shifts FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "waiter_shifts update if session open"
  ON public.waiter_shifts FOR UPDATE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()))
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "waiter_shifts delete if session open"
  ON public.waiter_shifts FOR DELETE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));

-- kitchen_shifts
DROP POLICY IF EXISTS "Authenticated manage kitchen_shifts" ON public.kitchen_shifts;
CREATE POLICY "kitchen_shifts insert if session open"
  ON public.kitchen_shifts FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "kitchen_shifts update if session open"
  ON public.kitchen_shifts FOR UPDATE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()))
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "kitchen_shifts delete if session open"
  ON public.kitchen_shifts FOR DELETE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));

-- expenses
DROP POLICY IF EXISTS "Authenticated manage expenses" ON public.expenses;
CREATE POLICY "expenses insert if session open"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "expenses update if session open"
  ON public.expenses FOR UPDATE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()))
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "expenses delete if session open"
  ON public.expenses FOR DELETE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));

-- advances (zusätzlich aufgenommen: Spec sagt „ggf. weitere mit session_id")
DROP POLICY IF EXISTS "Authenticated manage advances" ON public.advances;
CREATE POLICY "advances insert if session open"
  ON public.advances FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "advances update if session open"
  ON public.advances FOR UPDATE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()))
  WITH CHECK (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));
CREATE POLICY "advances delete if session open"
  ON public.advances FOR DELETE TO authenticated
  USING      (NOT public.is_session_locked_now(session_id) OR public.is_admin(auth.uid()));


-- -------------------------------------------------------------------------
-- 4) card_transactions: kein direktes session_id, verbunden via
--    waiter_shift_id → waiter_shifts.session_id
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated manage card_transactions" ON public.card_transactions;

CREATE POLICY "card_transactions insert if session open"
  ON public.card_transactions FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid())
    OR NOT public.is_session_locked_now(
         (SELECT ws.session_id FROM public.waiter_shifts ws WHERE ws.id = waiter_shift_id)
       )
  );

CREATE POLICY "card_transactions update if session open"
  ON public.card_transactions FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR NOT public.is_session_locked_now(
         (SELECT ws.session_id FROM public.waiter_shifts ws WHERE ws.id = waiter_shift_id)
       )
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR NOT public.is_session_locked_now(
         (SELECT ws.session_id FROM public.waiter_shifts ws WHERE ws.id = waiter_shift_id)
       )
  );

CREATE POLICY "card_transactions delete if session open"
  ON public.card_transactions FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR NOT public.is_session_locked_now(
         (SELECT ws.session_id FROM public.waiter_shifts ws WHERE ws.id = waiter_shift_id)
       )
  );


-- -------------------------------------------------------------------------
-- 5) bank_deposits: kein session_id → Sperr-Logik nicht anwendbar.
--    Bleibt bei TO authenticated USING (true). NICHT angefasst.
-- -------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 6) settings: Schreiben nur ab Manager
-- -------------------------------------------------------------------------
-- ZtProvision (manager-only Route) schreibt commission_min_revenue / _pct.
DROP POLICY IF EXISTS "Authenticated manage settings" ON public.settings;

CREATE POLICY "settings read (authenticated)"
  ON public.settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "settings insert (manager+)"
  ON public.settings FOR INSERT TO authenticated
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

CREATE POLICY "settings update (manager+)"
  ON public.settings FOR UPDATE TO authenticated
  USING      (public.has_min_permission('manager'::public.app_permission_level))
  WITH CHECK (public.has_min_permission('manager'::public.app_permission_level));

CREATE POLICY "settings delete (manager+)"
  ON public.settings FOR DELETE TO authenticated
  USING      (public.has_min_permission('manager'::public.app_permission_level));


-- -------------------------------------------------------------------------
-- 7) staff_restaurants: Schreiben nur Admin
-- -------------------------------------------------------------------------
-- Frontend schreibt nur aus admin-geschützten Pfaden (StaffManagement,
-- StaffMatrixView) – kein legitimes Nicht-Admin-Schreiben gefunden.
DROP POLICY IF EXISTS "Authenticated manage staff_restaurants" ON public.staff_restaurants;

CREATE POLICY "staff_restaurants read (authenticated)"
  ON public.staff_restaurants FOR SELECT TO authenticated USING (true);

CREATE POLICY "staff_restaurants insert (admin)"
  ON public.staff_restaurants FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "staff_restaurants update (admin)"
  ON public.staff_restaurants FOR UPDATE TO authenticated
  USING      (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "staff_restaurants delete (admin)"
  ON public.staff_restaurants FOR DELETE TO authenticated
  USING      (public.is_admin(auth.uid()));


-- -------------------------------------------------------------------------
-- 8) user_roles: Schreiben nur Admin (clientseitig)
-- -------------------------------------------------------------------------
-- Frontend ruft ausschließlich die Edge-Function manage-user-role auf, die
-- mit service_role arbeitet (RLS-Bypass). Wir setzen die Policy trotzdem
-- explizit, damit ein versehentlicher Direkt-Zugriff nicht offen ist.
-- Die in Migration 20260319202142 angelegten „No public ... user_roles"-
-- Policies (TO public, false) bleiben bestehen und blockieren weiterhin
-- anon zusätzlich.
DROP POLICY IF EXISTS "Authenticated manage user_roles" ON public.user_roles;

CREATE POLICY "user_roles insert (admin)"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "user_roles update (admin)"
  ON public.user_roles FOR UPDATE TO authenticated
  USING      (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "user_roles delete (admin)"
  ON public.user_roles FOR DELETE TO authenticated
  USING      (public.is_admin(auth.uid()));


-- -------------------------------------------------------------------------
-- 9) staff: bereits admin-only (Etappe 3, Policies "Admins manage/update/
--    delete staff" via is_admin). Hier bewusst nicht neu definiert.
-- 10) restaurants: bereits admin-only (Migration 20260612112548,
--    "Admins can insert/update/delete restaurants"). Hier ebenfalls
--    nicht angefasst.
-- -------------------------------------------------------------------------


-- -------------------------------------------------------------------------
-- 11) audit_logs: INSERT-Policy wiederherstellen
-- -------------------------------------------------------------------------
-- Etappe 3 hat „Audit logs insert via service" gedroppt, aber keine neue
-- INSERT-Policy angelegt → seither würden Client-INSERTs scheitern. Wir
-- stellen den ursprünglichen Zustand wieder her: INSERT ist für alle
-- eingeloggten Nutzer erlaubt (App loggt clientseitig); SELECT bleibt
-- Admin-only; UPDATE und DELETE haben weiterhin KEINE Policy → verboten.
DROP POLICY IF EXISTS "Audit logs insert via app" ON public.audit_logs;
CREATE POLICY "Audit logs insert via app"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (true);

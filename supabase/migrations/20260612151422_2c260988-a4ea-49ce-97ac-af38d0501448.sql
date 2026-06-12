-- =========================================================================
-- Etappe 3 – Nachtrag: Helper-Funktionen für Etappe-4-Scoping
-- =========================================================================
-- Hinweis: Die vorhergehende Migration 20260612150135 kündigte im Kopf
-- ("TODO ETAPPE 4") die Helper-Funktionen has_min_permission() und
-- current_staff_id() an, lieferte sie aber nicht aus. Diese Migration
-- liefert genau diese beiden Funktionen nach, ohne bestehende Policies
-- zu ändern. Spätere Etappe-4-Policies können dann darauf aufbauen.
-- =========================================================================

-- current_staff_id(): mappt die aktuelle auth.uid() → staff.id via profiles.
CREATE OR REPLACE FUNCTION public.current_staff_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT staff_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- has_min_permission(): prüft, ob der aktuelle User mindestens die
-- übergebene Permission-Stufe hat. Reihenfolge: staff < manager < admin.
-- Nutzt die bestehende get_staff_permission()-Funktion, erfindet also
-- keinen neuen Rollen-Prüfmechanismus.
CREATE OR REPLACE FUNCTION public.has_min_permission(_min public.app_permission_level)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lvl AS (
    SELECT public.get_staff_permission(public.current_staff_id()) AS current
  )
  SELECT CASE _min
    WHEN 'staff'::public.app_permission_level
      THEN (SELECT current IN ('staff','manager','admin') FROM lvl)
    WHEN 'manager'::public.app_permission_level
      THEN (SELECT current IN ('manager','admin') FROM lvl)
    WHEN 'admin'::public.app_permission_level
      THEN (SELECT current = 'admin' FROM lvl)
  END
$$;

-- Konsistent mit Etappe-3-Härtung: anon hat keinen Zugriff,
-- authenticated/service_role dürfen ausführen.
REVOKE EXECUTE ON FUNCTION public.current_staff_id() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.current_staff_id() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_min_permission(public.app_permission_level) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_min_permission(public.app_permission_level) TO authenticated, service_role;

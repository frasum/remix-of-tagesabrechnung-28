
-- Bootstrap-Trigger: erste Registrierung mit verwaltung@yum-thai.de wird Admin
CREATE OR REPLACE FUNCTION public.bootstrap_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bootstrap_email CONSTANT text := 'verwaltung@yum-thai.de';
  v_staff_id uuid;
  v_admin_exists boolean;
BEGIN
  -- Nur reagieren, wenn die E-Mail dem Bootstrap-Account entspricht
  IF lower(NEW.email) <> v_bootstrap_email THEN
    RETURN NEW;
  END IF;

  -- Sicherheit: nur, wenn noch KEIN Admin existiert
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE permission_level = 'admin'::app_permission_level
  ) INTO v_admin_exists;

  IF v_admin_exists THEN
    RETURN NEW;
  END IF;

  -- Existierenden aktiven Staff "Verwaltung" wiederverwenden, sonst anlegen
  SELECT id INTO v_staff_id
    FROM public.staff
   WHERE lower(name) = 'verwaltung' AND is_active = true
   LIMIT 1;

  IF v_staff_id IS NULL THEN
    INSERT INTO public.staff (name, role, is_active)
    VALUES ('Verwaltung', 'waiter', true)
    RETURNING id INTO v_staff_id;
  END IF;

  -- Profil mit staff verknüpfen
  UPDATE public.profiles
     SET staff_id = v_staff_id
   WHERE user_id = NEW.user_id;

  -- Admin-Rolle setzen (idempotent)
  INSERT INTO public.user_roles (staff_id, permission_level)
  VALUES (v_staff_id, 'admin'::app_permission_level)
  ON CONFLICT (staff_id)
  DO UPDATE SET permission_level = EXCLUDED.permission_level,
                updated_at = now();

  RETURN NEW;
END;
$$;

-- Trigger läuft NACH dem Profil-Anlegen (handle_new_user hat profile bereits eingefügt)
DROP TRIGGER IF EXISTS bootstrap_admin_after_profile ON public.profiles;
CREATE TRIGGER bootstrap_admin_after_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.bootstrap_admin_on_signup();

-- Admins können Restaurants anlegen, ändern und löschen
DROP POLICY IF EXISTS "Allow restaurants update via app" ON public.restaurants;

CREATE POLICY "Admins can insert restaurants"
ON public.restaurants FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update restaurants"
ON public.restaurants FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete restaurants"
ON public.restaurants FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

GRANT INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
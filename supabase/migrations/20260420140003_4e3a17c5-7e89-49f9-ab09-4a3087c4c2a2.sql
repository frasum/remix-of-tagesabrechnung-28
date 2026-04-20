-- Checklist-Tabellen: RLS-Policies anpassen (App-Layer-Auth wie restliche Tabellen)
DROP POLICY IF EXISTS "Admin full access priorities" ON public.checklist_priorities;
DROP POLICY IF EXISTS "Admin full access edge_functions" ON public.checklist_edge_functions;
DROP POLICY IF EXISTS "Admin full access settings" ON public.checklist_settings;

CREATE POLICY "Allow checklist_priorities access via app"
  ON public.checklist_priorities FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow checklist_edge_functions access via app"
  ON public.checklist_edge_functions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow checklist_settings access via app"
  ON public.checklist_settings FOR ALL
  USING (true) WITH CHECK (true);
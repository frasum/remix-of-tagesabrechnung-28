

## Plan: Schichten im Sharing-Link bearbeitbar machen

### Aktueller Zustand
Der Wochenplan im Sharing-Link zeigt Schichten nur lesend an. Die Edge Function `shared-zt-data` erlaubt per POST nur Änderungen an `payroll_notes` (Vorschuss, Besonderheiten, Urlaub-Tage).

### Änderungen

**1. Edge Function erweitern (`supabase/functions/shared-zt-data/index.ts`)**
- Neuen POST-Aktionstyp `upsert_shift` hinzufügen
- Akzeptiert: `employee_id`, `week_id`, `shift_date`, `start_time`, `end_time`, `absence_type`, `department`
- Berechnet `total_hours`, `sunday_holiday_hours`, `evening_hours`, `night_hours` serverseitig (via gleicher Logik wie im Frontend)
- Upsert auf `zt_shifts` mit `onConflict: employee_id, shift_date, department`
- Prüft, dass `week_id` zur freigegebenen Periode gehört

**2. SharedZtView Wochenplan-Tab editierbar machen (`src/pages/shared/SharedZtView.tsx`)**
- Zeit-Inputs (Start/Ende) in den Wochenplan-Zellen hinzufügen (analog zu `ZtWochenplan.tsx`)
- Rechtsklick/Kontextmenü für Urlaub/Krank-Einträge (oder vereinfachte Variante mit Dropdown)
- `upsertShift`-Mutation hinzufügen, die den neuen POST-Endpunkt nutzt
- Keyboard-Navigation (`handleTimeKeyDown`, `formatTimeInput`) übernehmen
- Bei gesperrter Periode (`status === 'locked'`) bleiben alle Felder disabled

**3. Shift-Berechnung in Edge Function**
Da `calculateShiftHours` ein Frontend-Utility ist, wird die Berechnungslogik direkt in der Edge Function dupliziert (einfache Stunden-Berechnung basierend auf Start/End-Zeit und Feiertag-Flag).

### Technische Details
- Die Edge Function unterscheidet POST-Aktionen über ein `action`-Feld im Body: `"upsert_note"` (bestehend) vs. `"upsert_shift"` (neu)
- Rückwärtskompatibilität: Wenn kein `action`-Feld vorhanden, wird wie bisher `upsert_note` angenommen
- Feiertags-Check nutzt die bereits geladene `bavarian_holidays`-Tabelle


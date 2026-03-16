

## Problem: Doppelte Namen im Trinkgeld-Ranking

Das Ranking gruppiert Kellner nach dem rohen `waiter_name`-String. Unterschiedliche Schreibweisen desselben Namens (z.B. "Pongsri" vs "PONGSRI", oder Leerzeichen-Unterschiede) erzeugen separate Einträge.

Der `useMonthlyStaffTips`-Hook hat dieses Problem bereits gelöst — dort wird primär nach `staff_id` gruppiert, mit Fallback auf normalisierte Namen und einer `canonicalNames`-Map.

## Lösung

**Datei: `src/hooks/useWaiterRanking.ts`**

1. **Staff-Tabelle laden** — `staff.id`, `staff.name` abfragen, um eine `canonicalNames`-Map (lowercase → Anzeigename) und `nameToStaffId`-Map zu bauen.

2. **Gruppierung ändern** — Statt `shift.waiter_name` als Key wird `shift.staff_id` verwendet (falls vorhanden), mit Fallback auf den normalisierten Namen (`toLowerCase().trim()`).

3. **Deduplizierung** — Beim Aufbau der `waiterData`-Map den stabilen Key (staff_id oder normalisierter Name) nutzen. Am Ende den kanonischen Anzeigenamen aus der Staff-Tabelle verwenden.

Dies entspricht exakt dem bewährten Muster aus `useMonthlyStaffTips`.


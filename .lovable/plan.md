

## Prüfung: Mitarbeiter-Anzeige über alle Tabs

### Gefundene Probleme

**1. Fehlender `is_active`-Filter im kumulierten Modus**
- `useCumulatedZtData.ts` (Zeile 82): Lädt Mitarbeiter aus `staff_restaurants` ohne `is_active`-Filter. Inaktive Mitarbeiter mit bestehenden Schichten könnten doppelt oder fehlerhaft angezeigt werden.
- `payroll-office-data` Edge Function (Zeile 243): Gleiches Problem — kein `is_active`-Filter auf dem Staff-Join.

**2. Supabase 1000-Zeilen-Limit bei Schichtabfragen**
Alle Schicht-Queries nutzen die Standardgrenze von 1000 Zeilen. Bei kumuliertem Modus (2 Restaurants × 5 Wochen × ~30 Mitarbeiter × ~30 Tage) können leicht über 1000 Schichten existieren. **Betroffene Stellen:**
- `useCumulatedZtData.ts`: `zt_shifts` Query (Zeile 64-76)
- `ZtBuchhaltung.tsx`: `zt_shifts` Query (Zeile 58-70)
- `ZtZusammenfassung.tsx`: `zt_shifts` Query (Zeile 108-120)
- `payroll-office-data/index.ts`: `zt_shifts` Query (Zeile 240-242)

Dies bedeutet: **Im kumulierten Modus könnten Schichten fehlen**, was zu falschen Stundensummen führt.

**3. Konsistenz über die Tabs**
Die Logik selbst (Sortierung, Filterung, Stunden-Berechnung) ist konsistent über Wochenplan, Zusammenfassung und Buchhaltung. Das Problem liegt ausschließlich bei den obigen zwei Punkten.

### Lösung

**Datei 1: `src/hooks/useCumulatedZtData.ts`**
- `is_active`-Filter hinzufügen: `.eq("staff.is_active", true)` bei der Mitarbeiter-Query
- Schicht-Query mit `.limit(5000)` ergänzen (oder Pagination — aber Limit reicht für realistische Datenmengen)

**Datei 2: `src/pages/zeiterfassung/ZtBuchhaltung.tsx`**
- Schicht-Query mit `.limit(5000)` ergänzen

**Datei 3: `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- Schicht-Query mit `.limit(5000)` ergänzen

**Datei 4: `supabase/functions/payroll-office-data/index.ts`**
- `is_active`-Filter auf Staff-Join hinzufügen
- Schicht-Query mit `.limit(5000)` ergänzen

4 Dateien, jeweils 1-2 Zeilen Änderung.


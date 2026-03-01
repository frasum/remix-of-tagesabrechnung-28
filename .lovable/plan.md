

## Vorschüsse automatisch in Buchhaltung-Besonderheiten anzeigen

Wenn ein Mitarbeiter in der Tagesabrechnung einen Vorschuss erhält (Tabelle `advances` mit `staff_name`, `amount`, `session_date` via Session), soll dieser automatisch in der Buchhaltungsansicht der Zeiterfassung erscheinen — sowohl im Vorschuss-Feld (Summe) als auch in den Besonderheiten (Datum + Betrag).

### Änderungen

**1. `src/pages/zeiterfassung/ZtBuchhaltung.tsx`**
- Neue Query: Alle `advances` laden, deren zugehörige `sessions.session_date` innerhalb der gewählten Periode liegt (Join über `session_id` → `sessions.session_date`), gefiltert auf `sessions.restaurant_id`
- Die Advances nach `staff_name` gruppieren und an `BuchhaltungRow` als neue Prop `advances` weitergeben (Matching über `emp.name === advance.staff_name`)

**2. `src/pages/zeiterfassung/buchhaltung/BuchhaltungRow.tsx`**
- Neue Prop `advances` (Array mit `{ amount, date }`) entgegennehmen
- Im Vorschuss-Feld: Wenn Advances vorhanden, die Summe als `defaultValue` vorbelegen (zusätzlich zum manuellen Wert aus `payroll_notes`)
- Im Besonderheiten-Feld: Automatisch generierten Text voranstellen, z.B. `"Vorschuss 28.02.: 50,00 €"`, gefolgt vom manuell eingetragenen Text

**3. Daten-Abfrage (in ZtBuchhaltung)**
- Query: `supabase.from('advances').select('*, sessions!inner(session_date)').eq('sessions.restaurant_id', restaurantId).gte('sessions.session_date', period.start_date).lte('sessions.session_date', period.end_date)`
- Ergebnis: Alle Vorschüsse im Periodenzeitraum, mit Datum aus der Session

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/pages/zeiterfassung/ZtBuchhaltung.tsx` | Advances-Query hinzufügen, nach Mitarbeiter gruppieren, an Row weiterreichen |
| `src/pages/zeiterfassung/buchhaltung/BuchhaltungRow.tsx` | Advances-Prop, automatische Vorschuss-Summe + Besonderheiten-Text anzeigen |


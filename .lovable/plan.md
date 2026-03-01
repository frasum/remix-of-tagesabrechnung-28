

## "Alle Restaurants" Toggle im Wochenplan

### Was sich aendert

Im Wochenplan wird ein "Alle Restaurants"-Button eingefuegt (wie in Buchhaltung/Zusammenfassung), der Mitarbeiter und Schichten aller Restaurants anzeigt.

### Umsetzung in `src/pages/zeiterfassung/ZtWochenplan.tsx`

1. **State + Imports**: `cumulated` State hinzufuegen, `useRestaurants` und `useCumulatedZtData` importieren.

2. **Daten umschalten**:
   - Wenn `cumulated=true`: Mitarbeiter aus `useCumulatedZtData` verwenden (alle Restaurants, dedupliziert nach ID+Department).
   - Wochen: Die deduplizierten Wochen aus `cumData` verwenden, aber fuer Shift-Queries alle Week-IDs (aus `weekNumberToAllIds`) der gewaehlten Woche heranziehen.
   - Shifts: Statt nur den einen `selectedWeekId` zu laden, alle korrespondierenden Week-IDs der selben Wochennummer laden.

3. **Shift-Query anpassen**: Im kumulierten Modus werden Shifts per `.in("week_id", allWeekIdsForSelectedWeek)` geladen statt `.eq("week_id", selectedWeekId)`.

4. **Period-Shifts**: Analog `allPeriodShifts` auf alle Week-IDs aller Restaurants erweitern.

5. **Bearbeitung**: Beim Upsert wird weiterhin der spezifische `week_id` des aktuell gewaehlten Restaurants verwendet. Im kumulierten Modus muss der passende `week_id` pro Restaurant/Woche ermittelt werden – dazu wird geschaut, welcher `week_id` zum Restaurant des Mitarbeiters gehoert.

6. **Button** neben dem Perioden-Select platzieren (gleiche Position/Style wie in Buchhaltung).

### Technische Details

- `weekNumberToAllIds` aus `useCumulatedZtData` liefert das Mapping von Wochennummer auf alle zugehoerigen Week-IDs.
- Fuer die Shift-Anzeige werden alle Week-IDs zusammengefuehrt; die Totals-Berechnung bleibt identisch.
- Der Export (PDF/Excel) wird im kumulierten Modus mit den erweiterten Daten gefuettert.
- Konflikterkennung (`getConflict`) bleibt unveraendert, da sie bereits Cross-Week arbeitet.


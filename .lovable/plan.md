

## Fix: Jean's Schichten fehlen in der Zusammenfassung bei YUM-Filter

### Ursache

**Wochenplan** und **Zusammenfassung** filtern Schichten unterschiedlich:

- **Wochenplan**: Lädt alle Schichten aller Wochen-IDs (beide Restaurants) und zeigt sie ohne Restaurant-Filter an → Jean's Schichten sind sichtbar
- **Zusammenfassung**: Hat einen zusätzlichen Filter, der prüft ob die `week_id` der Schicht zum Restaurant des Mitarbeiters passt (`weekIdToRestaurantId[s.week_id] !== emp.restaurant_id`). Wenn Jean's Schichten unter Spicery's Wochen gespeichert sind (weil die Eingabe im Spicery-Kontext erfolgte), aber Jean einen staff_restaurants-Eintrag für YUM hat, werden die Schichten **ausgefiltert** → Jean erscheint nicht

### Lösung

In `ZtZusammenfassung.tsx` den Restaurant-basierten Schicht-Filter entfernen. Die Mitarbeiterliste ist bereits nach Restaurant gefiltert — es ist unnötig, zusätzlich zu prüfen ob die Wochen-ID zum Restaurant passt.

**3 Stellen in `ZtZusammenfassung.tsx`:**

1. **`employeesWithShiftsUnfiltered`** (Zeile 173): Restaurant-Check auf Schichten entfernen
2. **`getEmployeeTotals`** (Zeile 184): Restaurant-Check auf Schichten entfernen  
3. **`getWeeklyHours`** (Zeile 235): Restaurant-Check auf Schichten entfernen

Konkret wird jeweils die Bedingung `cumData.weekIdToRestaurantId[s.week_id] !== (emp as any).restaurant_id` entfernt. Stattdessen reicht es, dass der Mitarbeiter bereits nach Restaurant gefiltert ist.

1 Datei, keine DB-Änderung.


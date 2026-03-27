

## Fix: Kumulierte Stunden bei "Alle Restaurants"

### Problem
Bei "Alle" erscheint ein Mitarbeiter, der in 2 Restaurants arbeitet, als 2 separate Zeilen mit identischen Stunden statt als **eine Zeile mit der Summe** aller Schichten.

### Ursache
`useCumulatedZtData` liefert pro Staff+Abteilung+Restaurant je einen Eintrag. Im "Alle"-Modus werden diese nicht zusammengeführt, und die Shift-Filterung nach `restaurant_id` verhindert sogar die korrekte Summierung.

### Lösung
In allen drei Tabs (Zusammenfassung, Buchhaltung, Wochenplan): Wenn `restaurantFilter === "all"`, die Employee-Liste nach `id+department` deduplizieren (ohne Restaurant-Unterscheidung) und die Shift-Berechnung **ohne** Restaurant-Filter durchführen — so werden alle Schichten korrekt summiert.

### Änderungen

**1. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- Employee-Filterung: Bei `restaurantFilter === "all"` die Employees nach `${id}-${dept}` deduplizieren (ersten Treffer behalten)
- `getEmployeeTotals()` Zeile 171: Restaurant-Filter nur anwenden wenn `restaurantFilter !== "all"` (d.h. bei spezifischem fremdem Restaurant oder Suche)
- `getWeeklyHours()` Zeile 222: Gleiche Bedingung
- Shift-Existenz-Check Zeile 160: Restaurant-Filter nur anwenden wenn `restaurantFilter !== "all"`
- RestaurantBadge: Bei "Alle" nicht anzeigen (da Mitarbeiter zusammengeführt)

**2. `src/pages/zeiterfassung/ZtBuchhaltung.tsx`**
- Gleiche Deduplizierung und Filter-Anpassung
- `getEmployeeTotals` aus `buchhaltung/utils.ts` wird inline angepasst oder die Shifts werden vorab gefiltert

**3. `src/pages/zeiterfassung/ZtWochenplan.tsx`**
- Gleiche Deduplizierung und Filter-Anpassung

### Logik-Zusammenfassung
```text
restaurantFilter = restaurantId  → lokale Daten, keine Deduplizierung
restaurantFilter = andere ID     → cumulated, nach Restaurant filtern, Badges zeigen
restaurantFilter = "all"         → cumulated, DEDUPLIZIEREN nach id+dept, ALLE Shifts summieren, keine Badges
```

3 Dateien, keine DB-Änderungen.


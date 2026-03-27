

## Fix: Doppelte Stunden im kumulierten Modus

### Problem
Im "Alle Restaurants"-Modus erscheinen Mitarbeiter, die in mehreren Restaurants arbeiten, als separate Zeilen (eine pro Restaurant+Abteilung). Die Shift-Filterung berücksichtigt die `restaurant_id` aber nur bei aktiver Suche (`isSearchActive`). Im kumulierten Modus ohne Suche werden deshalb **alle** Schichten in **jeder** Zeile gezählt → identische, doppelte Stunden.

### Lösung
Die Restaurant-Filterung muss immer greifen wenn kumulierte Daten verwendet werden — also bei `cumulated || isSearchActive`.

### Änderungen

**1. `src/pages/zeiterfassung/ZtBuchhaltung.tsx`**
- Zeile 169 und 232: `isSearchActive` durch `(cumulated || isSearchActive)` ersetzen

**2. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- Gleiche Stellen: Restaurant-Filter auch im kumulierten Modus aktivieren

**3. `src/pages/zeiterfassung/ZtWochenplan.tsx`**
- Gleiche Korrektur

3 Dateien, jeweils 2 Stellen: `isSearchActive` → `(cumulated || isSearchActive)`.


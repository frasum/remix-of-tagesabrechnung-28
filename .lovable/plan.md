

## Plan: Urlaubszeiträume in Besonderheiten anzeigen

Analog zur bestehenden Krankheits-Logik (`getSickDateRanges` / `formatSickRanges`) wird eine Urlaubs-Variante erstellt und in allen relevanten Stellen eingebaut.

### 1. Neue Funktionen in `src/lib/shiftCalculations.ts`

- `getVacationDateRanges(shifts)` — identisch zu `getSickDateRanges`, filtert aber auf `absence_type === 'urlaub'`
- `formatVacationRanges(ranges)` — Wrapper um `formatSickRanges` (gleiche Formatierung), oder direkt `formatSickRanges` wiederverwenden (da die Logik identisch ist)

Alternativ: Eine generische `getAbsenceDateRanges(shifts, type)` Funktion, die beide Fälle abdeckt. `formatSickRanges` wird zu `formatAbsenceRanges` (mit Alias für Rückwärtskompatibilität).

### 2. Änderungen in `BuchhaltungRow.tsx`

- Urlaubszeiträume berechnen und als Text `U: 03.02.–07.02. (5T)` in die `besonderheitenValue` einfügen
- Gleiche Logik wie bei `sickText`, nur mit `getVacationDateRanges`

### 3. Änderungen in `exportBuchhaltungPdf.ts` und `exportBuchhaltungExcel.ts`

- Urlaubszeiträume analog zu `sickText` berechnen und in `besText` einfügen
- Import der neuen Funktion(en)

### Ergebnis

Die Besonderheiten-Spalte zeigt dann z.B.:
`U: 03.02.–07.02. (5T) | K: 15.02.–17.02. (3T)`


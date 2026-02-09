

# PDF-Export: Team-Schichten aufteilen + TG Euro-Betrag anzeigen

## Uebersicht
Zwei Aenderungen an der Kellner-Details-Tabelle im PDF:

1. **Team-Schichten aufteilen**: Bei Team-Schichten (z.B. Cherry + Joy) werden beide Kellner als separate Zeilen angezeigt, mit halbiertem Umsatz und je einem Pool-Anteil.
2. **TG Euro-Betrag ergaenzen**: Neben dem TG % wird eine neue Spalte mit dem Euro-Betrag des Trinkgelds pro Kellner angezeigt.

## Ergebnis im PDF

| Kellner | Umsatz | Abgabe | TG | TG % |
|---------|--------|--------|----|------|
| Max     | 1.234 EUR | 14:32 | 45,20 EUR | 3,7% |
| Cherry  | 1.072 EUR | 15:42 | 45,20 EUR | 4,2% |
| Joy     | 1.072 EUR | 15:42 | 45,20 EUR | 4,2% |

## Technische Details

**Datei: `src/utils/pdfExport.ts`** (Zeilen 210-240)

- `map` wird durch `flatMap` ersetzt, um Team-Schichten in zwei Zeilen aufzuteilen
- Umsatz wird bei Teams halbiert (`pos_sales / 2`)
- Jeder Kellner bekommt 1 Share (statt 2 fuer die gesamte Team-Schicht)
- Neue Spalte "TG" mit `formatCurrency(waiterPoolShare)` wird zwischen "Abgabe" und "TG %" eingefuegt
- Header wird auf `['Kellner', 'Umsatz', 'Abgabe', 'TG', 'TG %']` erweitert
- columnStyles werden fuer die zusaetzliche Spalte angepasst


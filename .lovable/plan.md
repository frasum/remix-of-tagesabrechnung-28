

# Team-Schichten in zwei Zeilen aufteilen (mit korrekter Trinkgeld-%)

## Was wird geaendert

In der Trinkgeld-Pool-Tabelle auf der Kellner-Abrechnungsseite werden Team-Schichten (z.B. "Europe + Andi") in **zwei separate Zeilen** aufgeteilt.

## Darstellung vorher vs. nachher

```text
VORHER:
| Name            | Beitrag    | Anteil         | TG %  | Ø TG % |
| Europe + Andi   | 106,34 EUR | 87,83 EUR x 2  | 13.0% | 13.0%  |

NACHHER:
| Name            | Beitrag    | Anteil         | TG %  | Ø TG % |
| Europe          |  53,17 EUR | 87,83 EUR      | 13.0% | 13.0%  |
| Andi            |  53,17 EUR | 87,83 EUR      | 13.0% | 12.5%  |
```

## Berechnung pro Zeile

Fuer jede Person einer Team-Schicht gilt:

| Spalte | Berechnung | Erklaerung |
|--------|-----------|------------|
| **Beitrag** | `contribution / 2` | Der Gesamtbeitrag der Schicht wird halbiert |
| **Anteil** | `tipPerWaiter` | Jeder bekommt seinen individuellen Pool-Anteil (ohne "x 2") |
| **TG %** | `tipPerWaiter / (pos_sales / 2) * 100` | Trinkgeld-Prozent bezogen auf den halben Umsatz -- bleibt identisch fuer beide |
| **Ø TG %** | Lookup in `waiterTipAverages` | Fuer den ersten Kellner wird `waiterTipAverages[waiter_name]` verwendet, fuer den zweiten `waiterTipAverages[second_waiter_name]` -- dadurch erhaelt jeder seinen eigenen historischen Durchschnitt |

## Technische Umsetzung

### Datei: `src/pages/WaiterCashUp.tsx` (Zeilen 453-501)

- `waiterShifts.map()` wird zu `waiterShifts.flatMap()` geaendert
- Bei Team-Schichten (`shift.second_waiter_name` vorhanden) werden zwei `TableRow`-Elemente erzeugt
- Erste Zeile: Name des Haupt-Kellners, halber Beitrag, individueller Anteil, TG %, eigener Ø TG %
- Zweite Zeile: Name des zweiten Kellners, halber Beitrag, individueller Anteil, TG %, eigener Ø TG %
- Bei Einzel-Schichten bleibt alles wie bisher

### Keine Aenderungen noetig in:
- **PDF-Export** (`pdfExport.ts`) -- dort werden Team-Schichten bereits korrekt aufgeteilt
- **Tagesabrechnung** (`DailySummary.tsx`) -- dort ebenfalls bereits implementiert
- **Pool-Berechnung** -- `waiterShareCount`, `totalPool`, `tipPerWaiter` bleiben unveraendert, da Team-Schichten dort schon als 2 Anteile gezaehlt werden

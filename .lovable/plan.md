

## Problem

Im Datenkontext fuer die AI heisst die Spalte "Differenz" - das ist der Pool-Anteil / Kellner-Trinkgeld. Die AI interpretiert "Küchen-TG" faelschlicherweise als das gesamte Trinkgeld, weil die Spaltennamen unklar sind. Das Kellner-Trinkgeld (Pool-Anteil) und das Küchen-Trinkgeld sind zwei separate Werte.

## Loesung

| Datei | Aenderung |
|---|---|
| `supabase/functions/restaurant-chat/index.ts` | 1. Spaltenheader umbenennen: "Differenz" → "Kellner-TG (Pool-Anteil)" damit die AI den Unterschied versteht. 2. Im System-Prompt eine Erklaerung ergaenzen: "Kellner-TG ist der Pool-Anteil des Kellners. Küchen-TG ist der Anteil der an die Kueche geht. Beides sind separate Werte. Wenn nach Trinkgeld gefragt wird, beziehe dich auf den Kellner-TG (Pool-Anteil), nicht auf das Küchen-TG." |

### Details

Zeile 126: Header aendern zu `"Session-Datum | Restaurant | Name | POS-Umsatz | Kassiert | Kellner-TG (Pool-Anteil) | Küchen-TG | Stunden"`

Zeile 171ff: System-Prompt ergaenzen um:
```
- "Kellner-TG (Pool-Anteil)" ist das Trinkgeld das der Kellner behaelt (sein Anteil am Trinkgeld-Pool). "Küchen-TG" ist der separate Anteil der an die Kueche abgefuehrt wird. Wenn nach "Trinkgeld" eines Kellners gefragt wird, verwende den "Kellner-TG (Pool-Anteil)".
```


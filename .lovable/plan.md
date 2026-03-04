
## Ergebnis der Prüfung: `night_deep_hours` im Wochenplan

### Status: Korrekt implementiert — kein Fix nötig

Die `night_deep_hours` werden an allen relevanten Stellen korrekt gespeichert und gelesen:

| Stelle | Status | Detail |
|--------|--------|--------|
| **Wochenplan (Speichern)** | OK | `ZtWochenplan.tsx` Zeile 346: `night_deep_hours: hours.nightDeepHours` wird beim Upsert korrekt gesetzt |
| **Wochenplan (Anzeige)** | OK | Spalte "24-x" zeigt `night_hours` (gesamte Nachtstunden), `night_deep_hours` ist ein Subset davon und wird nicht separat angezeigt — das ist korrekt |
| **ShiftTimeOverride (Batch)** | OK | Alle 5 Upsert-Stellen setzen `night_deep_hours` korrekt |
| **syncWaiterToZt** | OK | Zeile 107: `night_deep_hours: hours.nightDeepHours` |
| **Brutto-Netto** | OK | Liest `night_deep_hours` aus der DB und aggregiert korrekt für 40%-Zuschlag |
| **shiftCalculations.ts** | OK | `nightDeepMinutes = Math.min(endMin, 240)` — korrekte Berechnung der 00:00–04:00 Stunden |

### Einziger Hinweis (kosmetisch, kein Bug)

In `ZtBruttoNetto.tsx` wird `(s as any).night_deep_hours` verwendet (Zeilen 123, 128). Das funktioniert, ist aber ein Type-Cast der vermieden werden könnte, indem man den Select-Return-Type explizit definiert. Das ist aber rein kosmetisch und hat keinen Einfluss auf die Berechnung.

### Fazit

Keine Änderungen notwendig. Die `night_deep_hours` werden korrekt berechnet, gespeichert und in der Brutto-Netto-Berechnung für den 40%-Nachtzuschlag verwendet.



## Zusammenfassung Zeitraum nach oben verschieben

Die "Zusammenfassung Zeitraum"-Card (Tage mit Daten, Küchen TG, Mitarbeiter TG, Ausgaben) wird über die StatCard-Zeile (Gesamtumsatz, Ø Tagesumsatz, etc.) verschoben.

### Änderung in `src/pages/Statistics.tsx`

Reihenfolge ändern von:
1. StatCards (Gesamtumsatz, Ø Tagesumsatz, Gesamt TG, Lieferumsatz)
2. Zusammenfassung Zeitraum Card

zu:
1. Zusammenfassung Zeitraum Card
2. StatCards (Gesamtumsatz, Ø Tagesumsatz, Gesamt TG, Lieferumsatz)

Rein strukturelle Umstellung, kein inhaltlicher Eingriff.


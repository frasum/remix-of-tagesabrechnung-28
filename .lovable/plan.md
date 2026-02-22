
# Verlauf-Tabelle: Spalten umstrukturieren

## Was wird geaendert

Die aktuellen Einzelspalten fuer Terminal 1 und Terminal 2 werden durch uebersichtlichere, zusammengefasste Spalten ersetzt. Ausserdem kommt eine neue Take-Away-Spalte hinzu.

### Neue Spaltenstruktur der Tabelle

| Datum | POS Total | Kreditkarten (%) | Take Away (%) | Tages-Bargeld | |
|-------|-----------|-------------------|---------------|---------------|----|

- **Kreditkarten**: Summe aus Terminal 1 + Terminal 2, mit Prozentangabe zum POS Total in Klammern
- **Take Away**: Summe aus Vectron Takeaway + OrderSmart + Wolt, mit Prozentangabe zum POS Total in Klammern
- Die beiden einzelnen Terminal-Spalten fallen weg

### Beispiel-Anzeige

- Kreditkarten: `4.492,66 EUR (78,2%)`
- Take Away: `1.200,00 EUR (20,9%)`

## Technische Details

### Datei: `src/pages/History.tsx`

1. **Tabellenkopf anpassen**: Die Spalten "Kredit Karten Terminal 1" und "Kredit Karten Terminal 2" werden durch eine einzelne Spalte "Kreditkarten (%)" ersetzt. Neue Spalte "Take Away (%)" wird eingefuegt.

2. **Tabellenzellen anpassen**: 
   - Kreditkarten-Zelle: `(session.terminal_1_total || 0) + (session.terminal_2_total || 0)` berechnen, Prozent als `kreditkarten / pos_total * 100` anzeigen
   - Take-Away-Zelle: `(session.takeaway_total || 0) + (session.ordersmart_revenue || 0) + (session.wolt_revenue || 0)` berechnen, Prozent als `takeaway / pos_total * 100` anzeigen
   - Prozentangabe in Grau/Muted darunter oder daneben anzeigen

3. Die bestehenden Spalten "Tages-Bargeld" und "Ansehen" bleiben unveraendert.

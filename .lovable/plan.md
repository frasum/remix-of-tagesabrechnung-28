

# Fix: Bargeld-Spalte zeigt Tageswerte statt kumuliertes Defizit

## Problem
Die Bargeld-Spalte in der Tabelle zeigt `bargeld` (= Tageswert + kumulierter Fehlbetrag aller Vortage). Dadurch sind fast alle Zeilen negativ, obwohl viele Tage einen positiven Bargeldumsatz hatten.

## Lösung

### `src/pages/CashBalance.tsx`
1. **Tabellenzeilen**: `row.bargeld` durch `row.rawBargeld` ersetzen — das ist der reine Tageswert ohne Deficit-Chaining
2. **GESAMT-Zeile**: Ebenfalls auf `rawBargeld` umstellen, damit die Summe konsistent bleibt
3. Die Deficit-Chaining-Logik bleibt für die Summary-Card (`CashBalanceSummary`) und den Wechselgeldbestand erhalten — dort gehört sie hin

### Betroffene Stellen
- Zeile ~330-337: Tabellenzeile `row.bargeld` → `row.rawBargeld`
- Zeile ~389-399: Footer-Summe `row.bargeld` → `row.rawBargeld`

Keine Änderungen an der Berechnungslogik in `useCashBalanceData.ts` nötig.


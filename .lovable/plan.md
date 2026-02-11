
## Bargeldbestand-Tabelle: Fehlbetrag Vortag einbeziehen

### Problem
Die taegliche Bargeld-Spalte in der Bargeldbestand-Tabelle (`useCashBalanceData`) berechnet das Bargeld pro Tag isoliert -- ohne den Fehlbetrag vom Vortag. Die Tagesabrechnung (`DailySummary`) rechnet den Fehlbetrag Vortag aber korrekt ein. Dadurch weichen die angezeigten Bargeld-Werte voneinander ab.

### Loesung
Den Fehlbetrag-Vortag-Mechanismus (deficit chaining) in `useCashBalanceData` einbauen. Wenn das Bargeld eines Tages negativ ist, wird dieser Betrag auf den naechsten Tag uebertragen -- genau wie in `usePreviousDayDeficit`.

### Technische Aenderung

**Datei: `src/hooks/useCashBalanceData.ts`**

Nach der Berechnung des rohen `bargeld` pro Tag wird ein Deficit-Chaining durchgefuehrt:

```text
Vorher (aktuell):
  bargeld = tagesumsatz + gutscheineVK + sonstigeEinnahme - abzuege
  -> Jeder Tag isoliert

Nachher:
  rawBargeld = tagesumsatz + gutscheineVK + sonstigeEinnahme - abzuege
  bargeld = rawBargeld + carryOver
  carryOver = bargeld < 0 ? bargeld : 0
  -> Fehlbetraege werden auf Folgetag uebertragen
```

Zusaetzlich muss der `initial_cash_deficit` aus der `restaurants`-Tabelle geladen und als Startwert fuer `carryOver` verwendet werden (identisch zum Verhalten in `usePreviousDayDeficit`).

**Ablauf:**
1. `restaurants.initial_cash_deficit` laden (bereits in der DB vorhanden)
2. Alle Zeilen chronologisch durchgehen
3. Pro Tag: `bargeld = rawBargeld + carryOver`, dann `carryOver = bargeld < 0 ? bargeld : 0`
4. Das Ergebnis-`bargeld` im Interface `CashBalanceRow` enthaelt nun den korrigierten Wert

### Betroffene Stellen
- **`src/hooks/useCashBalanceData.ts`**: Hauptaenderung -- deficit chaining einfuegen, `initial_cash_deficit` laden
- Keine Aenderung an `CashBalance.tsx` oder `ExcelLayout.tsx` noetig -- die UI zeigt bereits `row.bargeld` an

### Auswirkungen
- Die "Bargeld"-Spalte in der Bargeldbestand-Tabelle zeigt danach exakt die gleichen Werte wie die Tagesabrechnung
- Die kumulative Berechnung (Zusammenfassung oben) und die Abschoepfungs-Logik in `useRemainingCash` muessen ebenfalls geprueft werden, da sie auf `row.bargeld` basieren -- durch die Aenderung enthalten diese Werte nun bereits den Fehlbetrag, was Doppelzaehlungen verursachen koennte
- `useRemainingCash` summiert `row.bargeld` kumulativ und wendet Skimming an. Da der Fehlbetrag nun in `row.bargeld` eingerechnet ist, funktioniert die kumulative Logik weiterhin korrekt (negative Tage reduzieren den Kassenbestand automatisch)

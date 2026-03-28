

# Fix: GESAMT-Zeile in Bargeldbestand-Tabelle zeigt falschen Wert

## Problem
Die GESAMT-Zeile der Bargeld-Spalte nutzt eine Abschöpfungs-Simulation (`cumulativeCash`), während die Tageszeilen den einfachen `bargeld`-Wert zeigen. Das ergibt eine inkonsistente Tabelle (Tageswerte ~354 €, GESAMT 0,00 €).

## Lösung

### `src/pages/CashBalance.tsx`
- **GESAMT Bargeld-Zelle** (Zeile 389-394): Statt `cumulativeCash` die einfache Summe der gefilterten Tageswerte verwenden:
  ```tsx
  filteredData.reduce((sum, row) => sum + row.bargeld, 0)
  ```
- Damit ist die GESAMT-Zeile konsistent mit allen anderen Spalten: einfache Summe der angezeigten Werte.
- Die Abschöpfungs-Logik bleibt in der `CashBalanceSummary`-Card oben, wo sie hingehört.

Einzeilige Änderung, keine anderen Dateien betroffen.


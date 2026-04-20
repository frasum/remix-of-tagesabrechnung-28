

# Übertrag aus Vormonat als separate Kennzahl anzeigen

## Ziel
In der `CashBalanceSummary` (oben auf der Bargeldbestand-Seite) eine zusätzliche Kennzahl **„Übertrag aus Vormonat"** einfügen, direkt rechts neben „Bargeld bis [Monat]". Damit ist auf einen Blick sichtbar, wie viel Bargeld am Monatsanfang aus dem Vormonat übernommen wurde (positiv = Überschuss, negativ = Defizit).

## Berechnung
Der Übertrag = Summe aller `rawBargeld`-Werte aller Tage **vor** dem ausgewählten Monat (innerhalb des bereits geladenen 6-Monats-Datenfensters), ggf. ergänzt um den initialen Carry-Over aus `compute_carry_over` (für Daten, die älter als das Fenster sind).

Praktisch reicht für die Anzeige in der Summary-Karte:
```ts
const previousMonthCarryOver = useMemo(() => {
  if (!data || !selectedMonth) return 0;
  return data
    .filter((row) => row.date < `${selectedMonth}-01`)
    .reduce((sum, row) => sum + (row.rawBargeld ?? row.bargeld), 0);
}, [data, selectedMonth]);
```
Begründung: `useCashBalanceData` liefert bereits den initialen Carry-Over implizit über die Defizit-Chain — die einfache Summe aller `rawBargeld` vor dem Monat entspricht dem effektiv vererbten Bargeld (inkl. Korrektur-Transfers wie 866 € am 31.03.).

## Änderungen

### 1. `src/pages/CashBalance.tsx`
- Neue `useMemo`-Variable `previousMonthCarryOver` (siehe oben).
- Wert als neues Prop `carryOverFromPreviousMonth` an `<CashBalanceSummary />` übergeben.

### 2. `src/components/cash-balance/CashBalanceSummary.tsx`
- Neues optionales Prop `carryOverFromPreviousMonth?: number` ergänzen.
- Im `grid grid-cols-1 sm:grid-cols-4 gap-4` Block: das Grid auf **`sm:grid-cols-5`** erweitern und eine neue Zelle direkt **nach** „Bargeld bis [Monat]" einfügen:

```tsx
<div>
  <p className="text-sm text-muted-foreground">Übertrag aus Vormonat</p>
  <p className={`text-xl font-semibold tabular-nums ${
    carryOverFromPreviousMonth >= 0 ? 'text-success' : 'text-destructive'
  }`}>
    {carryOverFromPreviousMonth >= 0 ? '+' : ''}{formatCurrency(carryOverFromPreviousMonth)}
  </p>
</div>
```

- Reihenfolge der Kennzahlen danach:
  1. Bargeld bis [Monat] (Monatssumme)
  2. **Übertrag aus Vormonat** (neu)
  3. Bankeinzahlungen
  4. Verbleibendes Bargeld
  5. Wechselgeldbestand

### 3. „Verbleibendes Bargeld"-Logik
Da „Verbleibendes Bargeld" jetzt nur noch monatlich gerechnet wird (nach der vorherigen Änderung), den Übertrag dort **mit einbeziehen**, damit der Wert real bleibt:
```ts
const remainingCash = pettyCash + totalCash + carryOverFromPreviousMonth - totalDeposits;
```

## Layout-Hinweis
Bei Viewport ≥ `sm` werden 5 Kennzahlen nebeneinander angezeigt — bei aktuell 1631px ausreichend Platz. Auf kleineren Screens stapeln sie wie bisher untereinander.

## Keine weiteren Änderungen
- Keine DB-Änderung
- Tabelle, PDF/Excel-Export bleiben unverändert


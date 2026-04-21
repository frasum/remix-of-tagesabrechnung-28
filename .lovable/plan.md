

# „Bargeld bis April 2026" auf reine Monatssumme umstellen

## Problem
Die große Kennzahl oben links in der `CashBalanceSummary` zeigt aktuell **12.019,55 €** — das ist die kumulierte Bargeld-Summe **aller Tage bis Ende des ausgewählten Monats** (seit Beginn des Datenfensters, Standard: 6 Monate zurück).

Gewünscht ist stattdessen die **Tages-Bargeld-Summe nur für den ausgewählten Monat** — derselbe Wert, der unten in der Tabelle in der GESAMT-Zeile (Spalte „Bargeld") steht: **2.212,62 €** für April 2026.

## Lösung
Eine einzeilige Logik-Änderung in `src/pages/CashBalance.tsx`.

### Aktuell (Zeilen 55–60)
```ts
const cumulativeCash = useMemo(() => {
  if (!data || !selectedMonth) return 0;
  return data
    .filter((row) => row.date <= `${selectedMonth}-31`)   // ← alle Tage bis Monatsende
    .reduce((sum, row) => sum + (row.rawBargeld ?? row.bargeld), 0);
}, [data, selectedMonth]);
```

### Neu
```ts
const cumulativeCash = useMemo(() => {
  if (!data || !selectedMonth) return 0;
  return data
    .filter((row) => row.date.startsWith(selectedMonth))   // ← nur Tage im gewählten Monat
    .reduce((sum, row) => sum + (row.rawBargeld ?? row.bargeld), 0);
}, [data, selectedMonth]);
```

Variablenname kann zur Klarheit von `cumulativeCash` zu `monthlyCash` umbenannt werden (inkl. Übergabe an `<CashBalanceSummary totalCash={…} />`).

## Folge-Anpassungen (gleiche Datei, gleiche Logik)
Damit „Verbleibendes Bargeld" und „Wechselgeldbestand" weiter konsistent sind, muss auch `cumulativeDeposits` (Zeilen 63–68) auf den **gewählten Monat** beschränkt werden:

```ts
const cumulativeDeposits = useMemo(() => {
  if (!deposits || !selectedMonth) return 0;
  return deposits
    .filter((d) => d.deposit_date.startsWith(selectedMonth))
    .reduce((sum, d) => sum + d.amount, 0);
}, [deposits, selectedMonth]);
```

## Auswirkung
- Kennzahl oben links zeigt für April 2026: **2.212,62 €** (statt 12.019,55 €)
- Label bleibt „Bargeld bis April 2026" — passt weiterhin sprachlich
- Bankeinzahlungen, Verbleibendes Bargeld und Wechselgeldbestand beziehen sich konsistent auf den ausgewählten Monat
- Tabelle und PDF/Excel-Export sind nicht betroffen (nutzen bereits monatsgefilterte `filteredData`)

## Keine weiteren Änderungen
- Keine DB-Änderung
- Keine Änderung an `CashBalanceSummary.tsx` selbst — nur die übergebenen Props ändern sich


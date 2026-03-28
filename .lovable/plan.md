

# Fix: "Bargeld bis März" zeigt einfache Summe der Tabellenwerte

## Problem
Die Summary-Card "Bargeld bis März 2026" zeigt aktuell den Wert aus einer Abschöpfungs-Simulation (Skimming auf Portokasse), nicht die Summe der Tageswerte aus der Tabelle. Dadurch steht dort -368,34 € statt der tatsächlichen Gesamtsumme aller angezeigten Tageswerte.

## Lösung

### `src/pages/CashBalance.tsx`
Die `cumulativeCash`-Berechnung (Zeilen 55–69) vereinfachen: statt der Skimming-Simulation eine einfache Summe der `rawBargeld`-Werte bilden — konsistent mit der GESAMT-Zeile in der Tabelle.

```tsx
const cumulativeCash = useMemo(() => {
  if (!data || !selectedMonth) return 0;
  return data
    .filter((row) => row.date <= `${selectedMonth}-31`)
    .reduce((sum, row) => sum + (row.rawBargeld ?? row.bargeld), 0);
}, [data, selectedMonth]);
```

Einzeilige Änderung, keine anderen Dateien betroffen. Die Abschöpfungs-Logik für den Wechselgeldbestand muss ggf. separat erhalten bleiben — prüfe ob `wechselgeldbestand` noch die Simulation braucht.




## Plan: Schichtdaten-Zeitraum aus aktueller Periode übernehmen

### Problem
Die Felder "Von" und "Bis" unter "Schichtdaten (SFN)" sind leer und müssen manuell eingegeben werden. Sie sollen automatisch mit dem Start- und Enddatum der aktuell gewählten Abrechnungsperiode befüllt werden.

### Umsetzung

**Datei: `src/pages/zeiterfassung/ZtBruttoNetto.tsx`**

1. `useZt()` importieren und `selectedPeriodId` sowie `periods` auslesen.
2. Die aktuell gewählte Periode ermitteln und `dateFrom`/`dateTo` als Initialwerte auf `period.start_date` / `period.end_date` setzen.
3. Per `useEffect` bei Periodenwechsel die Datumswerte automatisch aktualisieren, sodass der Zeitraum immer der gewählten Periode entspricht.
4. Manuelle Änderungen bleiben weiterhin möglich.

### Technisches Detail

```
// Neuer useEffect:
useEffect(() => {
  const period = periods?.find(p => p.id === selectedPeriodId);
  if (period) {
    setDateFrom(period.start_date);
    setDateTo(period.end_date);
  }
}, [selectedPeriodId, periods]);
```

Kein Datenbankänderungen nötig -- reine Frontend-Logik.


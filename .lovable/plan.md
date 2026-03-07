

# Provisions-Topf: Tageweise statt Perioden-Durchschnitt berechnen

## Problem

Die aktuelle Logik berechnet den Durchschnitt über die **gesamte Periode** (`Gesamtumsatz / Gesamt-MA-Tage`). Selbst wenn einzelne Tage wie der 28.02. (6.437 / 5 = 1.287 €) den Schwellenwert überschreiten, bleibt der Pool bei 0 €, weil der Gesamtdurchschnitt unter 1.200 € liegt.

## Lösung

Die Berechnung auf **tageweise Auswertung** umstellen: Für jeden Tag prüfen, ob der Ø-Umsatz/MA den Schwellenwert erreicht. Nur die Tage, die den Schwellenwert überschreiten, tragen zum Pool bei.

### Änderung in `ZtProvision.tsx` — `result` Memo (Zeilen 360–382)

Neue Logik:

```typescript
// Pro Tag: wenn revenue/staffCount >= minRevenue → Überschuss in Pool
let pool = 0;
let qualifyingDays = 0;
for (const day of dailyBreakdown) {
  const dayAvg = day.staffCount > 0 ? day.revenue / day.staffCount : 0;
  if (dayAvg >= minRevenue) {
    const excess = day.revenue - (minRevenue * day.staffCount);
    pool += excess * (commissionPct / 100);
    qualifyingDays++;
  }
}
```

Die Verteilung auf Mitarbeiter bleibt gleich (proportional nach Stunden). Die Summary-Cards zeigen zusätzlich die Anzahl qualifizierender Tage an.

### Zusätzlich: Ø-Umsatz pro Tag in Tagesdetails anzeigen

Eine neue Spalte "Ø/MA" in der Tagesübersicht, die `revenue / staffCount` zeigt. Tage über dem Schwellenwert werden farblich hervorgehoben (grün), sodass sofort erkennbar ist, welche Tage in den Pool einfließen.

### Dateien

- `src/pages/zeiterfassung/ZtProvision.tsx` — einzige Datei


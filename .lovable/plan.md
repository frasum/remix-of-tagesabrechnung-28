

# Provision pro Stunde in der Summary-Card anzeigen

## Änderung

In der "Σ Provisionen"-Karte (Zeile 451-454) wird zusätzlich der Wert **Provision pro Stunde** angezeigt. Die Berechnung ist simpel: `totalCommission / totalHours` (mit Fallback auf 0 bei 0 Stunden).

**Eine Stelle ändern** in `src/pages/zeiterfassung/ZtProvision.tsx`, Zeilen 451-454:

```tsx
<div className="rounded-lg border border-border bg-card p-4">
  <p className="text-xs text-muted-foreground">Σ Provisionen</p>
  <p className="text-lg font-semibold tabular-nums">{fmt(result.totalCommission)} €</p>
  <p className="text-xs text-muted-foreground mt-1">
    {fmt(result.totalHours > 0 ? result.totalCommission / result.totalHours : 0)} € / Stunde
  </p>
</div>
```

Keine neuen Abhängigkeiten, keine Datenbankänderungen — reine Darstellungsergänzung.


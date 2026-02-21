

## Wechselgeldbestand farblich anpassen

Der Wechselgeldbestand soll basierend auf dem Schwellenwert von 2.000 € eingefärbt werden:

- **Unter 2.000 €**: Roter Hintergrund mit roter Zahl (destructive)
- **Ab 2.000 €**: Grüner Hintergrund mit grüner Zahl (success)

### Änderung

**Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`**

Die bestehende Logik für den Wechselgeldbestand prüft aktuell nur ob der Wert positiv oder negativ ist (`>= 0`). Diese Bedingung wird auf den Schwellenwert 2.000 € (bzw. den konfigurierten `pettyCash`-Wert) umgestellt.

Da der `pettyCash`-Wert in diesem Layout nicht direkt verfügbar ist, wird ein fester Schwellenwert von 2.000 € verwendet — alternativ könnte `pettyCash` als neue Prop übergeben werden.

```text
Vorher:
  className: (remainingCash ?? 0) >= 0 ? 'bg-success/10' : 'bg-destructive/10'
  Textfarbe:  (remainingCash ?? 0) >= 0 ? 'text-success' : 'text-destructive'

Nachher:
  className: (remainingCash ?? 0) >= 2000 ? 'bg-success/10' : 'bg-destructive/10'
  Textfarbe:  (remainingCash ?? 0) >= 2000 ? 'text-success' : 'text-destructive'
```

Eine einzelne Zeile in der Datei wird angepasst — keine weiteren Änderungen nötig.


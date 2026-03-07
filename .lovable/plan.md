

## Problem

Die CSS-Variablen `--chart-1` und `--chart-2` sind im Projekt nicht definiert, weshalb die Linien und Punkte im Umsatzvergleich-Chart schwarz dargestellt werden -- keine Farben, keine sichtbare Unterscheidung.

## Loesung

**Datei: `src/components/statistics/RestaurantOverlayChart.tsx`**

Ersetze die `hsl(var(--chart-1/2))` Referenzen durch konkrete Farben und verbessere die visuelle Darstellung:

1. Definiere zwei klare Farben direkt im Component (z.B. `#2563eb` blau fuer Restaurant A, `#f97316` orange fuer Restaurant B)
2. Fuege `AreaChart` statt `LineChart` mit leichtem Gradient unter den Linien hinzu fuer bessere Lesbarkeit
3. Erhoehe `strokeWidth` auf 3 und Dot-Groesse fuer bessere Sichtbarkeit
4. Farbige Legend-Eintraege mit den gleichen Farben

**Datei: `src/components/statistics/RestaurantComparison.tsx`**

Gleiche Farben dort ebenfalls durch konkrete Werte ersetzen, damit die farbigen Punkte und Split-Bars korrekt dargestellt werden.

**Datei: `src/index.css`** (Alternative)

Oder die CSS-Variablen `--chart-1` bis `--chart-5` im `:root` und `.dark` Selektor definieren, was alle Charts im Projekt auf einmal repariert. Das waere die sauberere Loesung.

### Empfohlener Ansatz: CSS-Variablen global definieren

```css
:root {
  --chart-1: 221 83% 53%;   /* blau */
  --chart-2: 24 95% 53%;    /* orange */
  --chart-3: 142 71% 45%;   /* gruen */
  --chart-4: 280 65% 60%;   /* lila */
  --chart-5: 350 80% 55%;   /* rot */
}
```

Das repariert sowohl den Overlay-Chart als auch die Vergleichs-Karten mit einer einzigen Aenderung.


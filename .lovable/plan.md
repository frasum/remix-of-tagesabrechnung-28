

## Plan: Restaurant-Vergleich optisch aufwerten

Das Problem: Die Progress-Balken sehen alle gleich aus (gleiche dunkelblaue Farbe), die Werte werden am Rand abgeschnitten, und das Layout ist visuell monoton.

### Redesign der `RestaurantComparison.tsx`

Statt generischer Progress-Bars wird jede Metrik-Zeile als **kompakte Vergleichskarte** dargestellt:

1. **Dual-Bar mit unterschiedlichen Farben**: Restaurant A bekommt `hsl(var(--chart-1))` (blau), Restaurant B bekommt `hsl(var(--chart-2))` (orange/gruen) -- custom `div`-Balken statt der Radix Progress-Komponente, damit Farben pro Restaurant steuerbar sind.

2. **Besseres Layout pro Metrik-Zeile**:
   - Label + Differenz-Badge oben
   - Darunter je Restaurant: Name links, farbiger Balken in der Mitte, Wert rechts
   - Der fuehrende Wert bekommt einen leichten farbigen Hintergrund-Akzent

3. **Grid-Layout statt Liste**: Die 8 Metriken in einem `grid sm:grid-cols-2` anordnen, sodass je 2 Metriken nebeneinander stehen. Jede Metrik wird eine eigene kleine Karte mit Border und Padding.

4. **Tage-Vergleich**: Wird als eigene kleine Karte im Grid dargestellt.

### Technische Umsetzung

- **Datei**: `src/components/statistics/RestaurantComparison.tsx` -- komplett umschreiben
- Progress-Komponente wird nicht mehr verwendet; stattdessen einfache `div`-Balken mit `style={{ width: proportion% }}` und individuellen Farben
- Keine neuen Dateien oder Dependencies noetig


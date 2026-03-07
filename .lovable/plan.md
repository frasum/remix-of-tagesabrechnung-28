

## Probleme im Screenshot

1. **Balken kaum sichtbar** -- die duennen Fortschrittsbalken sind fast gleich lang (beide nahe 100% weil relativ zum Max), dadurch kein visueller Unterschied erkennbar
2. **Keine Farb-Zuordnung** -- beide Balken sehen fast identisch aus (gleicher Gruenton)
3. **Kein "Gewinner" auf einen Blick** -- man muss die Zahlen lesen um zu verstehen wer fuehrt
4. **Zu viel leerer Raum** in den Karten

## Redesign-Ansatz: "Duell-Karten"

Statt horizontaler Balken ein **direktes Gegenueber-Layout** pro Metrik:

```text
┌─────────────────────────────────────────┐
│           Gesamtumsatz        +18.2%    │
│                                         │
│  Spicery          vs            YUM     │
│  30.224 €    ████████░░░░   25.565 €    │
│   Winner ◄──────────────                │
└─────────────────────────────────────────┘
```

Konkret pro MetricCard:
- **Oben**: Label zentriert, Differenz-Badge rechts
- **Mitte**: Zwei grosse Werte links und rechts, dazwischen ein **geteilter Balken** (split bar) -- links `chart-1` Farbe, rechts `chart-2` Farbe, proportional zum Anteil am Gesamtwert (z.B. 55% / 45%)
- **Gewinner-Markierung**: Der hoehere Wert bekommt `font-bold text-lg`, der niedrigere bleibt `text-sm text-muted-foreground`
- **Farbiger Punkt** (kleiner Kreis) vor jedem Restaurant-Namen fuer klare Zuordnung

### Split-Bar Logik
Statt zwei separate Balken: **ein** Balken, aufgeteilt in zwei Haelften proportional zum Verhaeltnis. Bei 30k vs 25k waere das ca. 55% links, 45% rechts. Das macht den Unterschied sofort visuell sichtbar.

### Technische Umsetzung

**Datei**: `src/components/statistics/RestaurantComparison.tsx` -- MetricCard komplett umbauen

1. Split-Bar: `flex` Container mit zwei `div`s, `width` per `style` basierend auf `valA / (valA + valB) * 100`
2. Werte gross und gegenueber: `flex justify-between` mit den zwei Werten
3. Farbpunkte: Kleine `w-2.5 h-2.5 rounded-full` Dots in `chart-1` / `chart-2`
4. Gewinner-Hervorhebung: Groesserer Font + leichter farbiger Hintergrund nur fuer den fuehrenden Wert

Keine neuen Dateien oder Dependencies noetig.


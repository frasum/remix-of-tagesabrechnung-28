

## Inaktive Tage (vor/nach Periode) visuell absetzen

### Problem
Die Header-Spalten für inaktive Tage (außerhalb der Periode) haben keinen grauen Hintergrund wie im Screenshot. Nur die Datenzellen bekommen `inactive-day`, aber der Spalten-Header bleibt normal gefärbt.

### Änderungen

| Datei | Änderung |
|---|---|
| `src/pages/zeiterfassung/ZtWochenplan.tsx` | Header-`<th>`-Elemente für inaktive Tage ebenfalls mit `inactive-day`-Klasse versehen (Zeile ~378-386); ggf. auch den Header-Text ausblenden oder abschwächen für inaktive Tage |
| `src/index.css` | `inactive-day`-Klasse auch für `thead th` wirksam machen, damit der Hintergrund im Header und in den Zellen einheitlich grau ist |

### Detail
- In der Header-Zeile (`<th>`) wird geprüft ob `activeDates.has(dateStr)` — falls nicht, wird `inactive-day` hinzugefügt und der Tag-Name in `text-muted-foreground` dargestellt
- Die bestehende `inactive-day`-Farbe `hsl(220 10% 95%)` passt zum Screenshot


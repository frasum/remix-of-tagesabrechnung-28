

## Fix: Abteilungs-Hintergrundfarbe im Wochenplan

### Problem
In `src/index.css` (Zeile 174-175) überschreibt die CSS-Regel `.wochenplan-table .dept-header-row td` den Hintergrund mit `bg-background` -- dadurch wird die Abteilungsfarbe (`dept-kueche-light`, `dept-gl-light`, `dept-service-light`) ignoriert.

### Lösung

| Datei | Änderung |
|---|---|
| `src/index.css` | Zeile 174-175: `bg-background` aus `.dept-header-row td` entfernen oder durch einen transparenten Hintergrund ersetzen, damit die `getDepartmentBgClass`-Klassen (z.B. warmer Pfirsich-Ton für Küche) sichtbar werden |

Die Abteilungs-Header im Wochenplan werden dann denselben farblichen Hintergrund zeigen wie in der Buchhaltungsansicht.


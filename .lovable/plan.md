

## Inaktive Tage grau statt rosa darstellen

Das Screenshot zeigt, dass Tage ausserhalb der aktiven Periode einen neutralen, hellgrauen Hintergrund haben sollen -- nicht den rosa Ton, der aktuell durch die letzte Änderung gesetzt wurde.

### Änderung

**`src/index.css`** -- Eine Zeile ändern:
- `.wochenplan-table .inactive-day`: Von `hsl(0 60% 96%)` (rosa) zurück zu einem neutralen Grau via `@apply bg-muted/30` oder `hsl(220 10% 95%)`.

| Datei | Änderung |
|---|---|
| `src/index.css` | `.inactive-day` Hintergrund auf neutrales Grau setzen |


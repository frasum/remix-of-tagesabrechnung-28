

## Wochenplan UI anpassen (Screenshot-Referenz)

Basierend auf dem Screenshot gibt es folgende visuelle Unterschiede zur aktuellen App:

1. **Totals-Spalten (Ges, So/F, 20-24, 24-x, U, K)**: Haben einen deutlichen rosa/lachsfarbenen Hintergrund statt dem aktuellen subtilen `bg-muted/20`
2. **Sonntags-Spalte**: Stärkerer rosa Hintergrund über die gesamte Spalte
3. **Inaktive Tage**: Ebenfalls rosa statt grau
4. **Generell saubereres Layout**: Mehr Weißraum, weniger visuelle Elemente

### Änderungen

**`src/index.css`** — Wochenplan-CSS-Klassen anpassen:
- `.sunday-col`: Stärkerer rosa Hintergrund (`bg-red-50` / `hsl(0 70% 95%)`)
- `.inactive-day`: Rosa statt grau (`bg-red-50` ähnlich Sunday)
- `.totals-col`: Deutlich rosa/lachsfarbener Hintergrund (`hsl(0 60% 94%)`)
- `.totals-header`: Gleicher rosa Ton für Header

**`src/pages/zeiterfassung/ZtWochenplan.tsx`** — Kleinere Styling-Anpassungen:
- Sunday-Header-Hintergrund intensivieren (`!bg-destructive/10` → stärker)
- Totals-Zellen-Klassen vereinheitlichen

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/index.css` | Wochenplan CSS-Klassen für rosa Totals/Sunday/Inactive |
| `src/pages/zeiterfassung/ZtWochenplan.tsx` | Styling-Klassen anpassen |


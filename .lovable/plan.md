

## Problem

Die meisten Staff-Einträge haben nur `name` befüllt. `first_name`, `last_name`, `nickname` und `perso_nr` sind NULL/0. Dadurch wird z.B. "Nok (0)" angezeigt statt vollständiger Daten.

## Lösung: Intelligentere Anzeige in BuchhaltungRow

Die Anzeige soll sich anpassen, je nachdem welche Daten vorhanden sind:

- **Wenn `first_name`/`last_name` vorhanden:** `Amonwan Phuthamma (BÄNG · 373)`
- **Wenn nur `name` vorhanden und `perso_nr` > 0:** `Nok (123)`  
- **Wenn nur `name` vorhanden und `perso_nr` = 0/NULL:** `Nok` (keine Klammer)

### Änderung in `src/pages/zeiterfassung/buchhaltung/BuchhaltungRow.tsx`

Zeile 23-25: Klammer-Teil nur anzeigen wenn `nickname` oder `perso_nr` vorhanden:

```tsx
{emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.name}
{(emp.nickname || emp.perso_nr) ? (
  <span className="text-xs text-muted-foreground">
    {" "}({emp.nickname ? `${emp.nickname} · ` : ""}{emp.perso_nr})
  </span>
) : null}
```

Damit verschwinden die hässlichen "(0)" bei unvollständigen Datensätzen.

Die fehlenden Stammdaten (Vor-/Nachname, Personalnummer) müssen separat in der Mitarbeiterverwaltung nachgepflegt werden — das ist kein automatischer Fix.


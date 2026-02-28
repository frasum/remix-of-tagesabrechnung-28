

## Änderung: Namensanzeige in der Buchhaltung

**Aktuelle Anzeige:** `Name (Spitzname) · Perso-Nr` — wobei Spitzname und Perso-Nr getrennt dargestellt werden.

**Gewünschte Anzeige:** `Vorname Nachname (Spitzname · Perso-Nr)`

### Änderung in `src/pages/zeiterfassung/buchhaltung/BuchhaltungRow.tsx`

Zeile 23 ändern von:
```tsx
{emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.name}{emp.nickname ? ` (${emp.nickname})` : ""}{" "}
<span className="text-xs text-muted-foreground tabular-nums">· {emp.perso_nr}</span>
```
zu:
```tsx
{emp.first_name || emp.last_name ? `${emp.first_name} ${emp.last_name}`.trim() : emp.name}{" "}
<span className="text-xs text-muted-foreground">({emp.nickname ? `${emp.nickname} · ` : ""}{emp.perso_nr})</span>
```

Ergebnis: **Frank Müller (Franky · 1234)** oder **Frank Müller (1234)** wenn kein Spitzname vorhanden.


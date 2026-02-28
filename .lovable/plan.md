

## Problem

Die meisten Mitarbeiter haben nur das `name`-Feld befüllt (z.B. "Frank", "Adisorn"), aber `first_name` und `nickname` sind `NULL`. Der Wochenplan zeigt `emp.nickname || emp.first_name` — beide leer → keine Namen sichtbar.

## Lösung

Zwei Änderungen:

### 1. `src/hooks/useZtEmployees.ts` — `name` Feld mit abfragen und im Mapping verwenden

- `staff!inner(...)` Select um `name` erweitern
- `ZtEmployee` Typ um `name: string` ergänzen
- Im Mapping: `name: row.staff.name` hinzufügen

### 2. `src/pages/zeiterfassung/Wochenplan.tsx` — Anzeigename mit `name` als Fallback

Zeile 483 ändern von:
```tsx
{emp.nickname || emp.first_name}
```
zu:
```tsx
{emp.nickname || emp.first_name || emp.name}
```

### 3. `src/hooks/useCrossRestaurantData.ts` — gleicher Fix für Cross-Restaurant-Ansicht

`name` ebenfalls in den Employee-Map aufnehmen (Zeile ~112).

Drei kleine Änderungen, kein Datenbankschema betroffen.


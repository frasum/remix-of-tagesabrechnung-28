

## Analyse

Die Datenbank hat bereits alles vorbereitet: Die Tabelle `staff_restaurants` enthält eine Spalte `zt_department` mit den Werten **"Küche"**, **"Service"** und **"GL"**. Aktuell wird dieses Feld aber im StaffDialog nicht angezeigt und kann daher nicht gesetzt werden.

## Plan

### 1. StaffDialog um Abteilungswahl pro Restaurant erweitern

Wenn ein Restaurant ausgewählt wird, soll darunter ein Select-Dropdown erscheinen, in dem die ZT-Abteilung gewählt werden kann: **Service**, **Küche** oder **GL**.

- State von `selectedRestaurants: string[]` ändern zu `selectedRestaurants: Map<restaurantId, { zt_department: string | null }>` (oder ein Record/Objekt)
- Beim Laden eines bestehenden Mitarbeiters die vorhandenen `zt_department`-Werte aus `staff_restaurants` auslesen
- Pro ausgewähltem Restaurant ein Select-Feld "Abteilung (Zeiterfassung)" mit den Optionen Service / Küche / GL anzeigen

### 2. StaffInput-Typ und Save-Logik anpassen (`useStaff.ts`)

- `restaurant_ids: string[]` ersetzen durch `restaurant_assignments: { restaurant_id: string, zt_department: string | null }[]`
- In `useCreateStaff` und `useUpdateStaff` das Insert/Update der `staff_restaurants`-Zeilen um `zt_department` erweitern

### 3. Bestehendes Verhalten bewahren

- Mitarbeiter ohne Abteilungszuweisung werden in der Zeiterfassung nicht angezeigt (das bestehende Query filtert `zt_department IS NOT NULL`)
- Die Abteilung ist optional -- wenn nichts gewählt wird, erscheint der Mitarbeiter einfach nicht in der Zeiterfassung

### Technische Details

```text
StaffDialog
├── Restaurant-Checkbox (wie bisher)
│   └── [wenn ausgewählt] Select: Abteilung (ZT)
│       ├── — (keine)
│       ├── Service
│       ├── Küche
│       └── GL
```

Dateien die geändert werden:
- `src/components/staff/StaffDialog.tsx` -- UI für Abteilungswahl
- `src/hooks/useStaff.ts` -- `StaffInput` Typ + Create/Update Mutations




# Fix: staffId bei PIN-Login setzen

## Problem

Wenn sich Mitarbeiter per PIN einloggen, wird `staffId` nicht gesetzt. Das hat zwei Auswirkungen:

1. **Manager sehen zu viel:** Statistiken, Verlauf und Bargeldbestand werden angezeigt, auch wenn sie in der Datenbank nicht freigeschaltet sind
2. **Restaurant-Switcher:** Der kuerzlich implementierte Filter (nur zugewiesene Restaurants anzeigen) greift ebenfalls nicht, da er auf `staffId` basiert

## Ursache

In `src/contexts/AuthContext.tsx`, Zeile 279-284, fehlt beim PIN-Login das Feld `staffId`:

```text
// Aktuell (PIN-Login):
authUser = {
  id: result.user.id,       // = Staff-ID
  name, role, permissionLevel
  // staffId fehlt!
}

// OAuth-Login setzt korrekt:
authUser = {
  ...
  staffId: roleData.staff_id   // vorhanden
}
```

## Loesung

Eine einzeilige Aenderung in `src/contexts/AuthContext.tsx`:

### `src/contexts/AuthContext.tsx` -- PIN-Login (Zeile ~279-284)

`staffId: result.user.id` zum AuthUser-Objekt hinzufuegen. Die `result.user.id` aus der `validate-pin` Edge Function ist bereits die Staff-ID aus der `staff`-Tabelle.

```text
Vorher:
  const authUser: AuthUser = {
    id: result.user.id,
    name: result.user.name,
    role: result.user.role,
    permissionLevel: result.permission_level || 'staff',
  };

Nachher:
  const authUser: AuthUser = {
    id: result.user.id,
    name: result.user.name,
    role: result.user.role,
    permissionLevel: result.permission_level || 'staff',
    staffId: result.user.id,
  };
```

## Auswirkung

Nach dieser Aenderung funktionieren fuer **alle** PIN-eingeloggten Mitarbeiter:

- **Navigationsfilter:** Manager sehen nur die ihnen zugewiesenen Seiten
- **Restaurant-Switcher:** Zeigt nur zugewiesene Restaurants (statt alle)
- **Session-Lock:** Die `unlockSession`-Funktion prueft bereits `user?.staffId` -- funktioniert dann auch korrekt

Keine weiteren Dateien muessen geaendert werden.

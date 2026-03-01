

## Änderung: "Name" → "Spitzname", altes Spitzname-Feld entfernen

Das Feld "Anzeigename" (intern `name`) wird zu **"Spitzname"** umbenannt. Das separate Feld "Spitzname" (intern `nickname`) wird komplett entfernt, da es redundant ist.

### Betroffene Dateien

**`src/components/staff/StaffDialog.tsx`**:
- Label "Anzeigename *" → "Spitzname *"
- Placeholder anpassen (z.B. "Maxi")
- Das gesamte Nickname-Feld (Zeilen 161-169) entfernen
- State `nickname` und zugehörige Logik entfernen
- `nickname` aus `handleSubmit` / `onSave` entfernen

**`src/components/staff/StaffDialogNative.tsx`** und **`StaffDialogSafe.tsx`**:
- Gleiche Änderungen falls dort ebenfalls ein Nickname-Feld existiert

**`src/hooks/useStaff.ts`**:
- `nickname` aus `StaffInput` entfernen (sofern vorhanden)
- Mutation-Logik: `nickname` nicht mehr separat senden (das `name`-Feld speichert jetzt den Spitznamen)

### Layout nach Änderung

```text
Spitzname *        [____________]
Nachname    Vorname
[________]  [________]
Perso-Nr.
[________]
Rolle *            [Service ▼]
```

Das Perso-Nr.-Feld rutscht in eine eigene Zeile oder teilt sich die Zeile mit einem anderen Feld.


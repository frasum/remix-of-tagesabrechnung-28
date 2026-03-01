

## Änderung: Spinner-Pfeile bei Personalnummer entfernen

Das `type="number"` Input-Feld für die Personalnummer zeigt native Browser-Spinner-Pfeile. Änderung zu `type="text"` mit `inputMode="numeric"` in allen StaffDialog-Varianten.

### Betroffene Dateien

- **`src/components/staff/StaffDialog.tsx`**: `type="number"` → `type="text"` + `inputMode="numeric"` beim Perso-Nr.-Feld
- **`src/components/staff/StaffDialogNative.tsx`**: Gleiches falls dort ein Perso-Nr.-Feld existiert


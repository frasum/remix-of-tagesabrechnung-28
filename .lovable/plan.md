

## Soft-Delete statt Hard-Delete

Mitarbeiter werden nicht mehr gelöscht, sondern nur deaktiviert (`is_active = false`). Deaktivierte Mitarbeiter verschwinden aus der normalen Ansicht.

### Änderungen

**`src/hooks/useStaff.ts`**
- `useDeleteStaff` umbenennen zu `useDeactivateStaff` — statt `.delete()` wird `.update({ is_active: false })` ausgeführt
- Toast-Nachricht ändern: "Mitarbeiter deaktiviert"
- Export-Name anpassen

**`src/pages/StaffManagement.tsx`**
- Import von `useDeleteStaff` → `useDeactivateStaff`
- `deleteMutation` → `deactivateMutation`
- Lösch-Dialog Text anpassen: "Mitarbeiter deaktivieren?" / "wird deaktiviert und erscheint nicht mehr in der Übersicht" / Button "Deaktivieren"
- `handleConfirmDelete` → `handleConfirmDeactivate`

**`src/components/staff/StaffMatrixView.tsx`**
- `onDelete` Prop-Name beibehalten (oder `onDeactivate`), Trash2-Icon durch ein passendes Icon ersetzen (z.B. `UserMinus` oder `Ban`)
- Tooltip ergänzen: "Deaktivieren"

**`src/hooks/useStaff.ts` (Query-Filter)**
- Die `useStaff`-Query filtert bereits inaktive Mitarbeiter je nach Kontext. Prüfen ob der Haupt-Query in StaffManagement inaktive ausschließt — falls nicht, `.eq('is_active', true)` ergänzen oder im Frontend filtern (da `allStaff` alle laden soll für die Matrix-Ansicht, sollte der Filter im Frontend bleiben wie aktuell).

Keine Datenbank-Migration nötig — `is_active` existiert bereits.


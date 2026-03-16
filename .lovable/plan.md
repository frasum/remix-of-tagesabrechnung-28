

## Listenansicht entfernen, Matrix als einzige Ansicht

### Änderungen

**`src/pages/StaffManagement.tsx`**
- `ViewMode` Type und `viewMode` State entfernen
- View-Mode-Toggle-Block (Zeilen 169–195) entfernen
- Listenansicht-Code (Zeilen 245–286: leerer Zustand + Table) entfernen — nur noch `StaffMatrixView` rendern
- Leerer Zustand bei `filteredStaff.length === 0` vor die Matrix setzen
- `onDelete={setDeleteStaff}` als neues Prop an `StaffMatrixView` übergeben
- Ungenutzte Imports bereinigen: `List`, `LayoutGrid`, `Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `StaffTableRow`

**`src/components/staff/StaffMatrixView.tsx`**
- Neues Prop `onDelete: (staff: Staff) => void` aufnehmen
- In jeder Zeile einen Löschen-Button (Trash2-Icon) als letzte Spalte ergänzen — gleicher Stil wie in `StaffTableRow` (ghost, destructive, opacity-0 group-hover:opacity-100)
- Neue Spaltenüberschrift "Aktionen" im Header


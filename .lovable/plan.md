

## Berechtigungen-Seite modernisieren

Die `/permissions`-Seite bekommt dasselbe Design wie die modernisierte Mitarbeiterverwaltung.

### Änderungen in `src/pages/PermissionManagement.tsx`

1. **Hero Header** mit Gradient-Banner (wie StaffManagement): `bg-gradient-to-br from-primary/10 via-primary/5`, Shield-Icon in abgerundetem Container, Subtitle mit Manager-Anzahl

2. **Manager-Cards modernisieren**:
   - Avatar-Initialen statt generischem User-Icon (farbiger Kreis mit Buchstabe, wie in StaffTableRow)
   - Subtilere Card-Styles: `border-border/50` mit leichtem Gradient-Hintergrund
   - Checkbox-Grid mit etwas mehr Padding und besserer visueller Gruppierung
   - Speichern-Button mit `shadow-sm` und konsistentem Styling

3. **Empty State** modernisieren: Größeres Icon in abgerundetem Container, wie bei StaffManagement

4. **Loading State**: Konsistenter animierter Pulse-Text statt nur Spinner


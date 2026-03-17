

## Plan: Geburtstage im Dienstplan anzeigen

### Was sich ändert
An Tagen, an denen ein Mitarbeiter Geburtstag hat (Tag+Monat stimmen überein), wird ein kleines 🎂-Icon in der Zelle angezeigt.

### Änderungen

**1. `src/hooks/useRestaurantEmployees.ts`**
- `date_of_birth` zum Select und zum `RestaurantEmployee`-Type hinzufügen

**2. `src/components/dienstplan/MonthlyGrid.tsx`**
- Einen `birthdaySet` als `Set<string>` berechnen (Schlüssel: `staffId-date`), der für jeden Mitarbeiter prüft, ob Tag+Monat seines `date_of_birth` mit einem Datum im Grid übereinstimmt
- Neuen Prop `isBirthday` an `ShiftCell` übergeben

**3. `src/components/dienstplan/ShiftCell.tsx`**
- Neuen Prop `isBirthday?: boolean` aufnehmen
- In jeder Zelle bei `isBirthday === true` ein kleines `Cake`-Icon (lucide-react) oder 🎂-Emoji in der Ecke anzeigen (ähnlich wie das ⚠-Conflict-Icon)


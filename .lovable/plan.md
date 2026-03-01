

## Analyse: Wird `staff.role` anderswo gebraucht?

**Ja, `staff.role` wird an vielen Stellen in der App aktiv verwendet:**

| Stelle | Verwendung |
|---|---|
| `src/pages/StaffManagement.tsx` | Filter-Tabs (Service / Küche / GL) nutzen `hasRole(s.role, ...)` und zählen Mitarbeiter pro Rolle |
| `src/components/staff/StaffTableRow.tsx` | Zeigt Rollen-Badges (Service, Küche, GL) basierend auf `enumToRoles(staff.role)` |
| `src/components/staff/StaffCard.tsx` | Icon und Farbe basierend auf `staff.role` (ChefHat vs UtensilsCrossed) |
| `src/contexts/AuthContext.tsx` | Login setzt `user.role` aus `staff.role` |
| `supabase/functions/validate-pin/index.ts` | PIN-Login gibt `staff.role` zurück |
| `src/pages/Login.tsx` | Übernimmt `role` aus PIN-Validierung |

### Fazit

Die "Rolle"-Checkboxen oben im Dialog können **trotzdem entfernt** werden — aber `staff.role` in der DB muss weiterhin gesetzt werden. Das passiert dann **automatisch**, indem beim Speichern alle gewählten Abteilungen über alle Restaurants gesammelt und via `rolesToEnum()` in den Enum-Wert umgewandelt werden.

### Plan

| Datei | Änderung |
|---|---|
| `src/components/staff/StaffDialogNative.tsx` | 1. State-Variablen `roleService`, `roleKitchen`, `roleGl` entfernen. 2. Die UI-Sektion "Rolle" (Zeilen ~240-280) entfernen. 3. Im `handleSubmit`: Rolle aus `restaurantDepts` ableiten — alle Departments über alle Restaurants sammeln, dann `rolesToEnum(allDepts.has('Service'), allDepts.has('Küche'), allDepts.has('GL'))`. 4. Validierung: mindestens eine Abteilung muss gewählt sein. |

Keine anderen Dateien betroffen — `staff.role` wird weiterhin korrekt in der DB gespeichert, nur die Quelle ändert sich (abgeleitet statt manuell).


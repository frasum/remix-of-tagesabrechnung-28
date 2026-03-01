

## Problem

`useRestaurantEmployees` dedupliziert Mitarbeiter nach `staff.id` und behält nur die erste gefundene Abteilung. Mitarbeiter wie "Lam Manager" mit GL + Service erscheinen daher nur in einer Abteilungs-Gruppe im Wochenplan.

## Lösung

Die Deduplizierung entfernen: Statt nach `staff.id` zu deduplizieren, jeden `staff_restaurants`-Eintrag als eigene Zeile zurückgeben. So erscheint ein Mitarbeiter in jeder zugewiesenen Abteilung.

### Betroffene Datei

| Datei | Änderung |
|---|---|
| `src/hooks/useRestaurantEmployees.ts` | Deduplizierung entfernen — stattdessen alle Zeilen direkt mappen. Jede `(staff_id, zt_department)`-Kombination wird zu einem eigenen `RestaurantEmployee`-Eintrag. |

### Auswirkung prüfen

Der Wochenplan (`ZtWochenplan`) gruppiert Mitarbeiter nach `department`. Durch die Änderung wird "Lam Manager" sowohl unter GL als auch unter SERVICE angezeigt — jeweils mit eigener Schichtzeile.


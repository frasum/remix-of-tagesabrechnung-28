

# Trinkgeld-Ranking Toggle sichtbar machen

## Problem

Die Mitarbeiterverwaltungs-Seite verwendet das `GlobalLayout`, das keinen Restaurant-Kontext bereitstellt. Daher ist `restaurantId` immer `null` und der Toggle zum Ein-/Ausschalten des Trinkgeld-Rankings wird nie gerendert.

## Loesung

Da die Staff-Seite kein einzelnes Restaurant im Kontext hat (Mitarbeiter koennen mehreren Restaurants zugeordnet sein), wird ein Restaurant-Dropdown direkt in der Toggle-Zeile angezeigt. Der Admin waehlt das Restaurant aus, fuer das er das Ranking ein- oder ausschalten moechte.

## Aenderungen

### `src/pages/StaffManagement.tsx`

1. `useRestaurants` Hook importieren (liefert alle Restaurants)
2. Neuen State `selectedRankingRestaurantId` hinzufuegen
3. Die Bedingung `{restaurantId && ...}` entfernen -- der Toggle-Bereich wird immer angezeigt, sobald Restaurants vorhanden sind
4. Ein kompaktes Select-Dropdown fuer das Restaurant neben dem Switch einbauen
5. `useShowTipRanking` mit dem ausgewaehlten Restaurant verbinden

### Technische Details

```text
+---------------------------------------------------------+
| [Trophy Icon]  Trinkgeld Ranking anzeigen               |
| Restaurant: [Dropdown: Restaurant A v]    [Toggle: ON]  |
+---------------------------------------------------------+
```

- `useRestaurants()` aus `@/hooks/useRestaurant` liefert die Liste
- Beim ersten Laden wird automatisch das erste Restaurant vorausgewaehlt
- Der `useShowTipRanking(selectedRestaurantId)` Hook reagiert auf Aenderungen
- Der Switch aendert die Einstellung fuer das jeweils gewaehlte Restaurant

### Betroffene Datei

| Datei | Aenderung |
|-------|-----------|
| `src/pages/StaffManagement.tsx` | Restaurant-Select + Toggle immer sichtbar machen |




# Küchen-Trinkgeld Monatsübersicht: Alle Restaurants anzeigen

## Problem

Die `MonthlyKitchenTipCard` übergibt nur die aktuelle `restaurantId` an den Hook. Küchenmitarbeiter, die in beiden Restaurants arbeiten, sehen daher nur das Trinkgeld eines Standorts.

## Lösung

Alle verfügbaren Restaurant-IDs an `useCurrentMonthTips` übergeben, statt nur die aktuelle.

### Änderung in `MonthlyKitchenTipCard.tsx`

1. `useRestaurants()` importieren und alle Restaurant-IDs sammeln
2. Statt `[restaurantId]` alle IDs an `useCurrentMonthTips` übergeben
3. Optional: Neben dem Mitarbeiternamen ein kleines Badge zeigen, wenn der Mitarbeiter in mehreren Restaurants Stunden hat (analog zur Batch-Berechnung)

### Betroffene Datei

| Datei | Änderung |
|---|---|
| `src/components/kitchen/MonthlyKitchenTipCard.tsx` | `useRestaurants` nutzen, alle Restaurant-IDs übergeben |




## MonthlyTipBreakdown: Immer alle Restaurants anzeigen (Mitarbeiter + Küche)

### Änderungen

| Datei | Änderung |
|---|---|
| `src/hooks/useMonthlyStaffTips.ts` | Neuen Parameter `restaurantIds?: string[]` in `fetchMonthlyStaffTips` akzeptieren. Wenn übergeben, `.in('restaurant_id', restaurantIds)` statt `.eq('restaurant_id', ...)` verwenden. |
| `src/components/statistics/MonthlyTipBreakdown.tsx` | `useRestaurants()` importieren, alle Restaurant-IDs extrahieren und an `useMonthlyStaffTips` übergeben. Dadurch werden immer beide Restaurants berücksichtigt, unabhängig von der oben gewählten Tab. |

### Details

1. **Hook**: `useMonthlyStaffTips` bekommt einen optionalen `restaurantIds: string[]` Parameter. Die Session-Query filtert dann mit `.in('restaurant_id', restaurantIds)`. Gleichnamige Mitarbeiter aus verschiedenen Restaurants werden automatisch zusammengeführt (gleicher Name = gleiche Zeile, Stunden/Trinkgeld addiert).

2. **Komponente**: Statt `restaurantId` aus `useRestaurant()` werden alle IDs aus `useRestaurants()` geladen und übergeben. Die Auswertung zeigt so immer die Gesamtdaten beider Standorte.


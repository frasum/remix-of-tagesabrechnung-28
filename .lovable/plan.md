

## Fix: "Alle" Modus zeigt nur Spicery-Mitarbeiter

### Analyse

Die Netzwerk-Requests zeigen `restaurant_id=eq.a1710390...` (nur Spicery) statt `restaurant_id=in.(...)` (beide). Das deutet darauf hin, dass `allRestaurantIds` zum Zeitpunkt der Query-Ausführung noch nicht beide IDs enthält oder ein Caching-Problem vorliegt.

Zusätzlich: `restaurantIds.sort()` im Cache-Key **mutiert** das memoized Array direkt, was zu React-Problemen führen kann.

### Änderungen

**`src/hooks/useStatistics.ts`** und **`src/hooks/useStatisticsComparison.ts`**:
- Cache-Key: `[...restaurantIds].sort().join(',')` statt `restaurantIds.sort().join(',')` (Array-Kopie vor Sort)

**`src/pages/Statistics.tsx`**:
- Vereinfachte, explizitere Logik für die Hook-Aufrufe:
  - `statsMode === 'single'`: `useStatistics(range, customRange, restaurantId)`
  - `statsMode === 'all'` oder `'compare'`: `useStatistics(range, customRange, undefined, allRestaurantIds)` -- aber nur wenn `allRestaurantIds.length > 0`
  - Fallback: Wenn `allRestaurantIds` leer ist (noch ladend), die Hooks mit `enabled: false` blocken statt mit leeren Arrays aufzurufen
- `isLoading`-State berücksichtigt auch den Ladezustand von `allRestaurants`, um keine veralteten Daten anzuzeigen

### Technische Details

```typescript
// Robusterer Cache-Key (keine Mutation)
const cacheKey = restaurantIds ? [...restaurantIds].sort().join(',') : restaurantId;

// Statistics.tsx - klarere Trennung
const isMultiMode = statsMode !== 'single';
const multiReady = isMultiMode && allRestaurantIds.length > 1;

const { data, isLoading } = useStatistics(
  timeRange,
  customRange,
  isMultiMode ? undefined : restaurantId,
  multiReady ? allRestaurantIds : undefined
);
```




## Plan: Conflict-aware "Vorwoche kopieren" + Realtime Conflict Cache Invalidation

### Problem 1: Stale conflict warnings
When a shift is deleted (or created/updated) in any restaurant, the `conflicting_shifts` query cache is not invalidated. The amber warning persists until a manual page reload.

**Fix**: In `useUpsertShift`, `useDeleteShift`, and `useBatchInsertShifts` — add `queryClient.invalidateQueries({ queryKey: ['conflicting_shifts'] })` alongside the existing `['shift_assignments']` invalidation.

### Problem 2: "Vorwoche kopieren" ignores cross-restaurant conflicts
Currently the copy function only checks if a shift already exists in the current restaurant for the target date. It does not check if the staff member is already scheduled at another restaurant.

**Fix**: In `DienstplanToolbar.tsx`, use the `useConflictingShifts` hook (already available) to get cross-restaurant conflicts for the target week. Filter out any shift where the staff member already has a conflict on the target date. Show a toast indicating how many were skipped.

### Files to Change

| File | Change |
|---|---|
| `src/hooks/useDienstplan.ts` | Add `['conflicting_shifts']` invalidation to `onSuccess` of `useUpsertShift`, `useDeleteShift`, and `useBatchInsertShifts` |
| `src/components/dienstplan/DienstplanToolbar.tsx` | Query cross-restaurant conflicts for target week dates; filter out conflicting shifts before batch insert; show skip count in toast |

### Implementation Details

**useDienstplan.ts** — 3 mutations get an additional invalidation line:
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['shift_assignments'] });
  queryClient.invalidateQueries({ queryKey: ['conflicting_shifts'] });
},
```

**DienstplanToolbar.tsx** — fetch all cross-restaurant shifts for the target week and filter:
```typescript
// Already have thisStart/thisEnd — query conflicting shifts for all staff in that range
const { data: conflicts } = useConflictingShifts(restaurantId, staffIds, thisStart, thisEnd);

// In handleCopyWeek, additionally filter:
if (conflicts?.has(`${s.staff_id}-${newDateStr}`)) return null;

// Toast: `X Schichten kopiert, Y wegen Konflikten übersprungen`
```

To get `staffIds`, extract unique staff IDs from `prevWeekShifts`.


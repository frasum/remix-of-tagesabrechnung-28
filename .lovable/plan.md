

## Problem

In der Mitarbeitertabelle werden Restaurant-Namen doppelt angezeigt, weil ein Mitarbeiter pro Restaurant mehrere Abteilungseinträge haben kann (z.B. Service + Küche bei YUM). Die Zeile `restaurantNames` in `StaffTableRow.tsx` (Zeile 36) gibt jeden `staff_restaurants`-Eintrag als separaten Badge aus — ohne Deduplizierung.

## Lösung

In `StaffTableRow.tsx`, Zeile 36, die Restaurant-Namen deduplizieren:

```typescript
// Vorher:
const restaurantNames = staff.staff_restaurants?.map(sr => sr.restaurants?.name).filter(Boolean) ?? [];

// Nachher:
const restaurantNames = [...new Set(staff.staff_restaurants?.map(sr => sr.restaurants?.name).filter(Boolean) ?? [])];
```

Das ist eine einzeilige Änderung. Danach erscheint jedes Restaurant nur noch einmal als Badge.


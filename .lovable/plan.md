

## Problem

The StaffCard displays two badges both labeled "Mitarbeiter" because:
1. **Role badge**: "Mitarbeiter" (for role `waiter` or `both`)
2. **Permission badge**: "Mitarbeiter" (for permission level `staff`)

These are two different concepts but share the same German label, making it look like a bug.

## Fix

Rename the permission level label from "Mitarbeiter" to "Basis" in `StaffCard.tsx` line 33, so the two badges are visually distinct:

- Role badge: `Mitarbeiter` / `Küche` (unchanged)
- Permission badge: `Basis` / `Manager` / `Admin`

This is a one-line change in `src/components/staff/StaffCard.tsx`.


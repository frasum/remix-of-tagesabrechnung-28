

## Problem

The badge "12/2025" is derived from `dateFrom` (the period's `start_date`). For the "Januar 2026" period, the start date is **26.12.2025**, so the code computes month=12, year=2025 -- which is misleading. It should reflect the actual payroll month from the period label (Januar 2026 = 01/2026).

**Root cause** (lines 174-175 in `ZtBruttoNetto.tsx`):
```typescript
const calculationYear = dateFrom ? new Date(dateFrom).getFullYear() : undefined;
const calculationMonth = dateFrom ? new Date(dateFrom).getMonth() + 1 : undefined;
```

## Fix

Derive the calculation month/year from the period's `end_date` instead of `start_date`. Since periods run from the 26th to the 25th, the end date always falls in the correct payroll month (e.g., 25.01.2026 = January 2026).

**Change**: Replace `dateFrom` with `dateTo` in lines 174-175:
```typescript
const calculationYear = dateTo ? new Date(dateTo).getFullYear() : undefined;
const calculationMonth = dateTo ? new Date(dateTo).getMonth() + 1 : undefined;
```

This single two-line change fixes both the badge display and the value sent to the `calculate-payroll` edge function.


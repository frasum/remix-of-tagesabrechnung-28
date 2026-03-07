

# Plan: Provisionsberechnung Tab in Zeiterfassung

## Overview
Add a new "Provisionsberechnung" tab under the Zeiterfassung navigation that calculates sales-based commissions for service staff based on a configurable minimum average revenue threshold.

## Data Sources
- **Revenue per waiter**: `waiter_shifts.pos_sales` joined with `sessions` (filtered by period/week from ZtContext)
- **Hours per waiter**: `waiter_shifts.hours_worked` from same shifts
- **Staff names**: `staff` table via `staff_id` on `waiter_shifts`
- **Minimum threshold**: Stored in `settings` table with key `commission_min_revenue` per restaurant (persisted, default 1200)

## Changes

### 1. Database: Store threshold setting
- Migration: No new table needed. Use existing `settings` table with key `"commission_min_revenue"` and value `{"amount": 1200}`.

### 2. New page: `src/pages/zeiterfassung/ZtProvision.tsx`
- Uses `useZt()` to get selected period/week context
- Fetches `waiter_shifts` joined with `sessions` for the selected period date range
- Groups by staff: sums `pos_sales` and `hours_worked`
- Implements the 3-step commission logic:
  1. Average revenue check against threshold
  2. Pool calculation: `(total - threshold × count) × 5%`
  3. Distribution by hours worked
- **UI layout**:
  - Top: `CurrencyInput` for min threshold (auto-saves to settings)
  - Status badge (green "Erreicht" / red "Nicht erreicht")
  - Summary cards: average revenue, pool amount, total distributed
  - Table: Name, Revenue (€), Hours (h), Commission (€)
  - Footer row with totals

### 3. Route: `src/App.tsx`
- Add lazy import for `ZtProvision`
- Add route `<Route path="provision" element={<ZtProvision />} />` inside the zeiterfassung layout

### 4. Tab navigation: `src/pages/zeiterfassung/ZtLayout.tsx`
- Add `{ label: "Provision", path: "provision", permPath: "zeiterfassung/provision" }` to `allTabs`

### 5. No new dependencies required
- Uses existing `CurrencyInput`, `Table`, `Badge`, `StatCard` components


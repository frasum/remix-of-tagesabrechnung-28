

## Problem

Currently the Buchhaltung, Zusammenfassung, and Wochenplan pages combine Sunday and Holiday hours into a single "So/Fei" column. The user wants them split into two separate columns: "So" (Sonntag 50%) and "Fei" (Feiertag 125%), so holiday surcharges are transparently shown and not mixed into the Sunday total.

## Changes

### 1. Update `EmployeeTotals` type (`buchhaltung/types.ts`)
- Add `sonntagStunden: number` and `feiertagStunden: number` fields
- Keep `soFei` for backward compatibility or remove it

### 2. Update `getEmployeeTotals` in `buchhaltung/utils.ts`
- Split the current `soFei` aggregation: use `is_holiday` flag on each shift to separate Sunday from Holiday hours
- The Shift type in `types.ts` needs `is_holiday` added
- The query already uses `select("*")` so the data is available

### 3. Update `BuchhaltungTableHead.tsx`
- Replace single "So/Fei" column with two columns: "So" and "Fei"
- Adjust colgroup widths

### 4. Update `BuchhaltungRow.tsx`
- Display `totals.sonntagStunden` and `totals.feiertagStunden` in separate `<td>` cells

### 5. Update `BuchhaltungFooter.tsx`
- Add the extra footer cell for the new column

### 6. Update `ZtZusammenfassung.tsx` and `ZtWochenplan.tsx`
- Same split in their local `getEmployeeWeekTotals` / totals computation
- Both pages have their own table headers that need the column split
- The Zusammenfassung Shift type needs `is_holiday` added

### 7. Export functions (`exportBuchhaltungPdf.ts`, `exportBuchhaltungExcel.ts`)
- Update column headers and data mapping to reflect So/Fei split

This change is purely presentational in the table views. The Brutto-Netto calculator already correctly separates Sunday and Holiday hours.


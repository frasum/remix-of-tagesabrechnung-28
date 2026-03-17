

## Plan: Filter Skills by Department in ShiftCell

### Problem
Currently, `ShiftCell` shows **all** skills a staff member has, regardless of the department view. When planning the kitchen, service skills like "BAR" or "SERVICE" also appear in the popover — and vice versa.

### Fix
In `ShiftCell.tsx`, filter `availableSkills` not only by the employee's assigned skill IDs but also by the current `department`. The `skills` array already contains a `category` field (`'kitchen'`, `'service'`, `'gl'`).

### Change

**`src/components/dienstplan/ShiftCell.tsx`** — line 46:

Replace:
```typescript
const availableSkills = skills.filter(s => employeeSkillIds.includes(s.id));
```

With:
```typescript
const availableSkills = skills.filter(s =>
  employeeSkillIds.includes(s.id) &&
  (department === 'kitchen'
    ? s.category === 'kitchen'
    : s.category === 'service' || s.category === 'gl')
);
```

This is a single-line change. No other files need modification — `department` is already passed as a prop to `ShiftCell`.


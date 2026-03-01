

## Plan: Konflikttage im Wochenplan visuell markieren

### Ziel
Wenn ein Mitarbeiter an einem Tag bereits eine Schicht in einem anderen Department oder Restaurant hat, soll die Zelle im Wochenplan visuell markiert (ausgegraut, disabled) werden.

### Änderung in `src/pages/zeiterfassung/ZtWochenplan.tsx`

**1. Neue Query: Alle Schichten aller angezeigten Mitarbeiter für die aktuelle Woche laden (ohne week_id-Filter)**
- Query auf `zt_shifts` mit `employee_id IN (...)` und `shift_date IN (...)`, aber **ohne** Einschränkung auf `week_id`
- So werden auch Schichten aus anderen Restaurants/Departments gefunden

**2. Conflict-Lookup-Funktion**
- `hasConflict(employeeId, date, department)` — prüft ob in den geladenen Daten eine Schicht existiert, die nicht zum aktuellen Department/Week gehört
- Gibt `true` zurück wenn Konflikt besteht

**3. Visuelle Markierung der Zellen**
- Zellen mit Konflikt: Inputs werden `disabled`, Hintergrund wird `bg-amber-50` (leichtes Gelb/Orange), mit Tooltip "Schicht in [Department] eingetragen"
- Kein Editieren möglich bei Konflikt (wie bei gesperrter Periode)

### Technische Details

```typescript
// Neue Query: globale Schichten für die Wochentage
const employeeIds = sortedEmployees.map(e => e.id);
const dateStrings = weekDays.map(d => format(d, "yyyy-MM-dd"));

const { data: globalShifts } = useQuery({
  queryKey: ["zt-shifts-global", employeeIds, dateStrings],
  queryFn: async () => {
    const { data } = await supabase
      .from("zt_shifts")
      .select("employee_id, shift_date, department, week_id")
      .in("employee_id", employeeIds)
      .in("shift_date", dateStrings);
    return data ?? [];
  },
  enabled: employeeIds.length > 0 && dateStrings.length > 0,
});

// Conflict check
const getConflict = (empId, date, dept) => {
  return globalShifts?.find(s =>
    s.employee_id === empId &&
    s.shift_date === date &&
    (s.department !== dept || s.week_id !== selectedWeekId)
  );
};
```

In der Zellen-Render-Logik:
- `const conflict = getConflict(emp.id, dateStr, emp.department)`
- Wenn `conflict`: Zelle bekommt `bg-amber-50 dark:bg-amber-900/20`, Inputs werden disabled, Tooltip zeigt `"Bereits in ${conflict.department} eingetragen"`


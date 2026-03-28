

# Fix: Appel erscheint weiterhin doppelt in Zusammenfassung

## Analyse

Die Deduplizierung in beiden Views (Admin + Lohnportal) sieht im Code korrekt aus — `id + department` als Key. Trotzdem erscheint Appel doppelt. Mögliche Ursachen:

1. Die Edge-Function `shared-zt-data` liefert Mitarbeiter **ohne** Deduplizierung — bei Mehrfachzuweisungen kommen Duplikate, die erst clientseitig gefiltert werden müssen
2. In der Admin-Zusammenfassung (`ZtZusammenfassung`) und im Lohnportal (`SharedZtView`) wird die Deduplizierung zwar durchgeführt, aber möglicherweise in einer Race-Condition umgangen, wenn `cumulated` sich ändert

## Lösung: Dreifache Absicherung

### 1. Edge-Function: `supabase/functions/shared-zt-data/index.ts`
Employees **bereits serverseitig** nach `id + department` deduplizieren (Zeile 322–331), sodass bei "Alle" nur ein Eintrag pro Person+Abteilung ankommt.

### 2. Lohnportal: `src/pages/shared/SharedZtView.tsx` — `ZusammenfassungTab`
Sicherheits-Dedup direkt in der Rendering-Komponente (Zeile 768), bevor `employees.map()` iteriert:

```tsx
const dedupedEmployees = useMemo(() => {
  const seen = new Set<string>();
  return employees.filter(e => {
    const key = `${e.id}-${e.department}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}, [employees]);
// Then use dedupedEmployees.map(...) instead of employees.map(...)
```

### 3. Admin-Zusammenfassung: `src/pages/zeiterfassung/ZtZusammenfassung.tsx`
Gleiche Sicherheits-Dedup in der Render-Schleife (Zeile 305), falls `employees` trotz vorheriger Filterung noch Duplikate enthält.

**3 Dateien betroffen:** Edge-Function + SharedZtView + ZtZusammenfassung.


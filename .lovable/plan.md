

## Problem

Die PDF/Excel-Exports der Zusammenfassung in **PayrollPortal** und **SharedZtView** uebergeben `weekNumberToAllIds` nicht an die Export-Funktionen. Die Exports bauen daher intern ein Mapping nur aus den deduplizierten Wochen (eine ID pro Wochennummer). Schichten aus anderen Restaurants haben aber andere `week_id`s, die in diesem Mapping fehlen — sie zaehlen zum Gesamt, aber nicht zu den Wochenspalten.

## Loesung

| Datei | Zeile | Aenderung |
|---|---|---|
| `src/pages/shared/PayrollPortal.tsx` | 866 | `weekNumberToAllIds` an `exportZusammenfassungPdf` uebergeben |
| `src/pages/shared/PayrollPortal.tsx` | 869 | `weekNumberToAllIds` an `exportZusammenfassungExcel` uebergeben |
| `src/pages/shared/SharedZtView.tsx` | 709 | `weekNumberToAllIds` an `exportZusammenfassungPdf` uebergeben |
| `src/pages/shared/SharedZtView.tsx` | 711 (Excel) | `weekNumberToAllIds` an `exportZusammenfassungExcel` uebergeben |

Konkret: den 5. Parameter (`externalWeekNumberToIds`) bei den Export-Aufrufen ergaenzen, z.B.:
```typescript
exportZusammenfassungPdf(periodLabel, employees, weeks, shifts as any, weekNumberToAllIds)
```


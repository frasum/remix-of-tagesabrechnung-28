

## Problem

Das Problem ist dasselbe Key-Mismatch wie bei den `additional_waiters`, nur diesmal bei **primären Schichten**:

Die Funktion `waiterKey` verwendet `ws.staff_id || ws.waiter_name.toLowerCase().trim()`. Ältere `waiter_shifts`-Einträge haben kein `staff_id` gesetzt. Dadurch entstehen für denselben Mitarbeiter **zwei Map-Einträge**:

```text
Schicht MIT staff_id   → key = "uuid-abc"  → { hours: 20.7, tip: 262 }
Schicht OHNE staff_id  → key = "pon"        → { hours: 0,    tip: 81  }  ← kein staff_id, Fallback auf Name
```

Das erklärt auch warum "Pon" doppelt auftaucht (#4 und #15) und "Tu" 0 Stunden hat (alle seine Schichten mit `staff_id` haben möglicherweise andere Keys als die ohne).

## Lösung

Die `waiterKey`-Funktion muss bei fehlendem `staff_id` den Namen gegen die `nameToStaffId`-Map prüfen — genau wie es bereits für `additional_waiters` gemacht wird:

### Änderung in `src/hooks/useMonthlyStaffTips.ts`

**Zeile 100-101** — `waiterKey` Funktion erweitern:
```typescript
const waiterKey = (ws: { staff_id?: string | null; waiter_name: string }) =>
  ws.staff_id || nameToStaffId[ws.waiter_name.toLowerCase().trim()] || ws.waiter_name.toLowerCase().trim();
```

**Zeile 159-160** — Gleiche Anpassung für `kitchenKey`:
```typescript
const kitchenKey = (ks: { staff_id?: string | null; staff_name: string }) =>
  ks.staff_id || nameToStaffId[ks.staff_name.toLowerCase().trim()] || ks.staff_name.toLowerCase().trim();
```

So werden alle Schichten desselben Mitarbeiters unter einem einzigen Key (bevorzugt `staff_id`) zusammengeführt, unabhängig davon ob die einzelne Schicht eine `staff_id` hat oder nicht.


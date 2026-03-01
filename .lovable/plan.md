

## Problem: Küchenschicht wird nicht in Zeiterfassung übernommen

Die Sync-Funktion `syncKitchenShiftToZt` sucht den Mitarbeiter über `staff_restaurants` mit `zt_department = 'Küche'`. Wenn der Küchenmitarbeiter aber keine Zuordnung in `staff_restaurants` mit genau dieser Abteilung hat (z.B. gar kein Eintrag in `staff_restaurants` für dieses Restaurant, oder `zt_department` ist `null`/anders), wird er nicht gefunden und der Sync bricht still ab.

### Lösung

Die `findStaffByName`-Funktion in `syncWaiterToZt.ts` erweitern, sodass sie bei Küchenmitarbeitern als Fallback auch ohne exakte `zt_department`-Übereinstimmung sucht. Konkret:

| Datei | Änderung |
|---|---|
| `src/lib/syncWaiterToZt.ts` | `findStaffByName`: Wenn die Suche mit `zt_department = 'Küche'` kein Ergebnis liefert, Fallback-Suche nur nach `restaurant_id` und Name durchführen. Falls gefunden, wird der Eintrag trotzdem für den Sync verwendet. |

### Alternative (robusterer Ansatz)

Statt Fallback: Beim Hinzufügen eines Küchenmitarbeiters auf der KitchenTipSplit-Seite direkt die `staff.id` mitgeben (statt nur den Namen), und in `syncKitchenShiftToZt` die `employee_id` direkt verwenden. Dazu:

| Datei | Änderung |
|---|---|
| `src/lib/syncWaiterToZt.ts` | `findStaffByName`: Fallback ohne `zt_department`-Filter hinzufügen, wenn erster Versuch fehlschlägt. |

```text
findStaffByName("Max", restaurantId, "Küche")
  → 1. Versuch: staff_restaurants WHERE zt_department = 'Küche' → kein Treffer
  → 2. Versuch: staff_restaurants WHERE restaurant_id = X (ohne dept-Filter) → Treffer
  → return staff_id
```

Damit werden auch Mitarbeiter synchronisiert, die zwar der Küche zugeordnet sind (`staff.role = 'kitchen'`), aber in `staff_restaurants` kein explizites `zt_department = 'Küche'` gesetzt haben.


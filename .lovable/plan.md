

## Fix: Portal und SharedZtView zeigen falsche Stunden bei Restaurant-Filter

### Problem
Das Lohnbüro-Portal und die SharedZtView (Freigabe-Link) filtern Schichten nach `weekToRestaurant[s.week_id] === effectiveRestaurant`. Dies schließt Schichten aus, die unter einem anderen Restaurant-Kontext gespeichert wurden (z.B. Jean arbeitet bei YUM, aber Schichten sind unter Spicery-Wochen gespeichert).

**Auswirkung**: YUM zeigt im Portal GESAMT 2644,58 (327 Schichten) statt 3163,37 (390 Schichten) — eine Differenz von 519 Stunden und 63 Schichten.

### Ursache
Identischer Bug wie zuvor im Admin (ZtZusammenfassung, ZtBuchhaltung), aber diesmal in den Portal-Dateien.

### Lösung
In beiden Dateien die `filteredShifts`-Logik ändern: Statt nach `weekToRestaurant` zu filtern, alle Schichten durchlassen (die Filterung passiert bereits über `filteredEmployees` → `employeesWithShifts`, die nur Mitarbeiter des gewählten Restaurants enthalten).

**Datei 1: `src/pages/shared/PayrollPortal.tsx`** (Zeile 381-384)
- `filteredShifts`: Den `weekToRestaurant`-Filter entfernen, stattdessen nach `employee_id`s der `filteredEmployees` filtern

**Datei 2: `src/pages/shared/SharedZtView.tsx`** (Zeile 143-147)
- `filteredShifts`: Identische Änderung — nach `employee_id`s der `filteredEmployees` filtern statt nach `weekToRestaurant`

Konkret wird in beiden Dateien:
```typescript
// ALT:
return shifts.filter(s => weekToRestaurant[s.week_id] === effectiveRestaurant);

// NEU:
const empIds = new Set(filteredEmployees.map(e => e.id));
return shifts.filter(s => empIds.has(s.employee_id));
```

**Hinweis**: Da `filteredShifts` von `filteredEmployees` abhängt, muss die `useMemo`-Dependency-Liste angepasst werden. Zudem muss in `SharedZtView` sichergestellt werden, dass `filteredEmployees` vor `filteredShifts` berechnet wird (ist bereits der Fall).

2 Dateien, keine DB-Änderung.


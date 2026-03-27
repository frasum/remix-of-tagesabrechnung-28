

# Plan: Abteilungsübergreifende Konflikterkennung im Dienstplan

## Problem
Der `useConflictingShifts`-Hook prüft nur Schichten in **anderen Restaurants** (`.neq('restaurant_id', restaurantId)`). Schichten im **selben Restaurant, aber anderer Abteilung** (z.B. Coco ist im Service eingeteilt, erscheint aber in der Küche ohne Hinweis) werden nicht erkannt.

## Lösung
Den `useConflictingShifts`-Hook erweitern, damit er **auch** Schichten im selben Restaurant mit anderer Abteilung erkennt. Die Conflict-Map liefert dann statt nur des Restaurant-Namens einen beschreibenden Text wie "Service (Spicery)" oder "Küche".

## Änderungen

### 1. `src/hooks/useDienstplan.ts` — `useConflictingShifts` erweitern
- Zusätzlich zur bestehenden Query (andere Restaurants) eine zweite Query für **gleiches Restaurant, andere Abteilung** ausführen
- Beide Ergebnisse in einer gemeinsamen Map zusammenführen
- Für abteilungsinterne Konflikte den Text z.B. auf "Service" oder "Küche" setzen, für restaurantübergreifende weiterhin den Restaurant-Namen

Parameter `department` hinzufügen, damit die aktuelle Abteilung bekannt ist.

### 2. `src/components/dienstplan/MonthlyGrid.tsx` — `department` an Hook übergeben
- Den `department`-Prop an `useConflictingShifts` weiterreichen

### 3. Verhalten bei Konflikten (bereits implementiert, keine Änderung nötig)
- Amber-Rand und ⚠-Icon werden bereits über `conflictRestaurant` gesteuert
- Blockierung neuer Zuweisungen bei Konflikt funktioniert bereits via `toast.error`
- Der angezeigte Text passt sich automatisch an (z.B. "Bereits eingeteilt: Service")

## Technische Details

```text
useConflictingShifts(restaurantId, department, staffIds, start, end)
│
├─ Query 1 (bestehend): shift_assignments WHERE restaurant_id != X
│  → Map: "staff-date" → Restaurant-Name
│
├─ Query 2 (neu): shift_assignments WHERE restaurant_id == X AND department != Y
│  → Map: "staff-date" → Abteilungs-Name (Service/Küche)
│
└─ Merge beider Maps → eine einheitliche conflictMap
```


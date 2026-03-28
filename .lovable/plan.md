

# Fix: Schichten-Scoping in SharedZtView (Lohnbüro-Portal) Zusammenfassung

## Problem
Im Lohnbüro-Portal (`SharedZtView`) erscheint Appel bei "Alle" doppelt (14 + 2 Schichten statt einmal 16), und die `getEmpTotals` / `getWeeklyHours` Funktionen in der ZusammenfassungTab nutzen die `weekToRestaurant`-Zuordnung nicht für Restaurant-Scoping.

## Ursache
Die `ZusammenfassungTab`-Komponente in `SharedZtView.tsx` (Zeile 700–806) hat zwei Probleme:
1. `getEmpTotals` (Zeile 728) und `getWeeklyHours` (Zeile 720) filtern Schichten nicht nach Restaurant — bei Einzelauswahl (z.B. YUM) werden trotzdem alle Schichten gezählt
2. Der `exportShifts` scoped korrekt, aber die Anzeige-Funktionen nicht

## Lösung

### `src/pages/shared/SharedZtView.tsx` — ZusammenfassungTab (Zeile 700–806)

1. **`isShiftInScope` Helper hinzufügen** — analog zur Admin-Zusammenfassung:
```tsx
const isShiftInScope = (s: Shift) => {
  if (weekToRestaurant) {
    // weekToRestaurant is only passed when "all" is selected
    // In that case, don't filter — show all
    return true;
  }
  return true;
};
```

Eigentlich ist das Problem anders: Wenn ein **einzelnes** Restaurant gewählt ist, werden `filteredShifts` bereits in SharedZtView korrekt auf die `restaurantWeekIds` eingeschränkt (Zeile 143–152). Die Shift-Daten sind also schon richtig gefiltert.

Das eigentliche Problem liegt wahrscheinlich darin, dass `filteredEmployees` bei "Alle" die Dedup korrekt macht, aber `employeesWithShifts` dann doppelte Einträge liefert — oder die Admin-Zusammenfassung den gerade erst angewendeten Fix noch nicht reflektiert.

**Eigentliche Änderung**: Die `getEmpTotals` und `getWeeklyHours` in ZusammenfassungTab nutzen `exportShifts` (das bereits Restaurant-scoped ist) statt `shifts`:

```tsx
// Zeile 720-726 und 728-739: 
// "shifts" ersetzen durch "exportShifts" für konsistentes Scoping
const getWeeklyHours = (...) => {
  return exportShifts.filter(...).reduce(...);
};
const getEmpTotals = (...) => {
  const empShifts = exportShifts.filter(...);
  ...
};
```

`exportShifts` (Zeile 709–719) filtert bereits Schichten nach Restaurant-Zugehörigkeit bei "Alle". Bei Einzelauswahl sind `shifts` = `filteredShifts` bereits korrekt gefiltert, also ist `exportShifts` dort identisch.

Einzige Datei betroffen: `src/pages/shared/SharedZtView.tsx`.


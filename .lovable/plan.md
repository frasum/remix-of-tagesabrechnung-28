

## Problem

`PayrollZusammenfassungTab` ruft `useSfnMode()` eigenständig auf (Zeile 874). Dieser Hook nutzt `useState` — jede Komponente bekommt eine eigene, unabhängige Kopie des States. Wenn der Parent-Toggle den Modus ändert, bekommt die Zusammenfassung davon nichts mit.

Im Gegensatz dazu funktioniert `PayrollBuchhaltungTab` korrekt, weil dort `sfnMode` als **Prop vom Parent** durchgereicht wird (Zeile 493).

## Lösung

`PayrollZusammenfassungTab` soll `sfnMode` als Prop erhalten (wie Buchhaltung), statt den Hook selbst aufzurufen.

### Änderungen in `src/pages/shared/PayrollPortal.tsx`

1. **Prop `sfnMode` an `PayrollZusammenfassungTab` durchreichen** (Zeile 474):
   ```tsx
   <PayrollZusammenfassungTab
     sfnMode={sfnMode}          // ← NEU
     weeks={weeks}
     shifts={filteredShifts}
     ...
   />
   ```

2. **Funktionssignatur erweitern** (Zeile 867): `sfnMode: SfnMode` als Prop hinzufügen.

3. **`useSfnMode()`-Aufruf entfernen** (Zeile 874) und stattdessen die Prop verwenden.

4. **`key` hinzufügen** auf der Komponente für sauberen Remount:
   ```tsx
   <PayrollZusammenfassungTab key={`zus-${sfnMode}`} sfnMode={sfnMode} ... />
   ```


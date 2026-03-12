

## Problem

Der Mitarbeitername in der Zeiterfassung stimmt nicht, obwohl er in der Mitarbeiterkartei (Spitzname-Feld) geändert wurde.

**Ursache**: Die Zeiterfassung zeigt `nickname` (ein separates DB-Feld) mit höchster Priorität an. Das Spitzname-Feld im StaffDialog schreibt aber in `staff.name`. Wenn `nickname` gesetzt ist (z.B. durch thaitime-Import), überschreibt es den geänderten `name`-Wert in der Anzeige.

Beispiel: `nickname = "net"`, `name = "gunc"` → ZT zeigt "net" statt "gunc".

## Lösung

Beim Speichern eines Mitarbeiters `nickname` automatisch auf den gleichen Wert wie `name` (Spitzname) setzen. So wird der im Dialog eingegebene Spitzname sofort auch in der Zeiterfassung sichtbar.

### Änderungen

**`src/hooks/useStaff.ts`** – In `useCreateStaff` und `useUpdateStaff`:
- Beim Insert/Update `nickname` auf den Wert von `name` setzen (damit beide Felder synchron bleiben).

Das betrifft zwei Stellen:
1. `useCreateStaff` → `staffData` um `nickname: staffData.name` ergänzen
2. `useUpdateStaff` → `staffData` um `nickname: staffData.name` ergänzen (falls `name` mitgeschickt wird)


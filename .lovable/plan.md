

## Änderung: Rollenbezeichnung "Mitarbeiter" → "Service"

Nur dort, wo "Mitarbeiter" als Rollenbezeichnung (Gegenstück zu "Küche") verwendet wird, wird der Text zu "Service" geändert. Seitenüberschriften wie "Mitarbeiterverwaltung" oder Buttons wie "Neuer Mitarbeiter" bleiben unverändert.

### Betroffene Stellen

**`src/components/staff/StaffCard.tsx`** (Zeile 18):
- `'Mitarbeiter'` → `'Service'` in `roleLabel`

**`src/pages/StaffManagement.tsx`**:
- Tab-Label `Mitarbeiter ({waiterCount})` → `Service ({waiterCount})` (Zeile 185)
- Gruppenüberschrift `Mitarbeiter ({group.waiters.length})` → `Service ({group.waiters.length})` (Zeile 257)
- Gruppenüberschrift ohne Restaurant `Mitarbeiter ({...length})` → `Service ({...length})` (Zeile 291)

**`src/hooks/useStaff.ts`** — Prüfen ob dort "Mitarbeiter" als Rollenbezeichnung in Fehlermeldungen vorkommt (vermutlich nicht, da es dort "Mitarbeiter" im Sinne von "Angestellter" ist → bleibt).

**`src/components/staff/StaffDialog.tsx`** — Prüfen ob Rollen-Dropdown "Mitarbeiter" als Option zeigt → falls ja, zu "Service" ändern.


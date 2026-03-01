

## Problem

Das Feld `participates_in_pool` auf der `staff`-Tabelle wird aktuell nur in der **Mitarbeiter-Abrechnung** (WaiterCashUp) als Default berücksichtigt. Die **Küchen-Trinkgeld-Seite** (KitchenTipSplit) prüft dieses Feld nicht — Mitarbeiter mit `participates_in_pool = false` können dort weiterhin hinzugefügt werden und erhalten Trinkgeld.

## Lösung

Mitarbeiter mit `participates_in_pool = false` sollen auf der Küchen-Trinkgeld-Seite **nicht auswählbar** sein. Das StaffSelect-Dropdown filtert diese automatisch heraus.

### Änderungen

| Datei | Änderung |
|---|---|
| `src/components/shared/StaffSelect.tsx` | Neue optionale Prop `excludeNonPoolParticipants?: boolean`. Wenn `true`, werden Mitarbeiter mit `participates_in_pool = false` aus der Liste gefiltert. |
| `src/pages/KitchenTipSplit.tsx` | `excludeNonPoolParticipants={true}` an das StaffSelect übergeben. |

### Technisch

Das StaffSelect nutzt `useActiveStaff` / `useActiveStaffByRestaurant`, die bereits `*` von der `staff`-Tabelle laden — das Feld `participates_in_pool` ist also schon verfügbar. Es muss nur ein zusätzlicher Filter auf `filteredStaff` angewendet werden.




## Rolle-Dropdown durch Checkboxen ersetzen (Service, Küche, GL)

### Problem
Aktuell ist die Rollenwahl ein Dropdown mit drei Optionen: Service, Küche, Service & Küche. Der User möchte stattdessen drei unabhängige Checkboxen (Service, Küche, GL), die frei kombinierbar sind.

### Datenbank-Änderung

Die `staff_role` Enum hat aktuell die Werte `waiter | kitchen | both`. Um alle Kombinationen mit GL abzubilden, muss die Enum erweitert werden:

| Checkbox-Kombination | Enum-Wert |
|---|---|
| Service | `waiter` |
| Küche | `kitchen` |
| GL | `gl` (neu) |
| Service + Küche | `both` |
| Service + GL | `waiter_gl` (neu) |
| Küche + GL | `kitchen_gl` (neu) |
| Alle drei | `all` (neu) |

**Migration**: `ALTER TYPE staff_role ADD VALUE 'gl'; ADD VALUE 'waiter_gl'; ADD VALUE 'kitchen_gl'; ADD VALUE 'all';`

### Code-Änderungen

| Datei | Änderung |
|---|---|
| `src/hooks/useStaff.ts` | `StaffRole` Type erweitern um `'gl' \| 'waiter_gl' \| 'kitchen_gl' \| 'all'`. Hilfsfunktionen zum Konvertieren zwischen Checkbox-State (`{service, kitchen, gl}`) und Enum-Wert. |
| `src/components/staff/StaffDialogNative.tsx` | Dropdown (Zeilen 197-209) ersetzen durch drei native Checkboxen für Service, Küche, GL. State als drei Booleans verwalten, beim Submit in den passenden Enum-Wert konvertieren. |
| `src/pages/StaffManagement.tsx` | Filterlogik und Gruppierung anpassen, damit GL-Rollen korrekt erkannt werden (z.B. `role === 'gl'` oder `role === 'waiter_gl'` etc.). |

### UI im Dialog

```text
Rolle *
☑ Service
☐ Küche
☐ GL
```

Mindestens eine Checkbox muss gewählt sein (Validierung).

### Hilfsfunktionen (in useStaff.ts)

```typescript
function rolesToEnum(s: boolean, k: boolean, g: boolean): StaffRole
function enumToRoles(role: StaffRole): { service: boolean; kitchen: boolean; gl: boolean }
function hasRole(role: StaffRole, check: 'waiter'|'kitchen'|'gl'): boolean
```

Die `hasRole`-Funktion wird überall dort verwendet, wo bisher `role === 'waiter' || role === 'both'` steht, um alle neuen Kombinationen abzudecken.


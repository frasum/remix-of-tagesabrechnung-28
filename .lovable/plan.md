
# Mitarbeiter-Dropdowns nach Restaurant filtern

## Ziel
Die Personalauswahl (StaffSelect, SecondWaiterSelect) soll nur Mitarbeiter anzeigen, die dem aktuellen Restaurant zugeordnet sind -- nicht alle Mitarbeiter global.

## Technische Umsetzung

### 1. `StaffSelect` erweitern (`src/components/shared/StaffSelect.tsx`)
- Neue optionale Prop `restaurantId?: string | null` hinzufuegen
- Wenn `restaurantId` gesetzt ist, wird `useActiveStaffByRestaurant(restaurantId, role)` statt `useActiveStaff(role)` verwendet
- Wenn kein `restaurantId` uebergeben wird, bleibt das Verhalten unveraendert (Rueckwaertskompatibilitaet)

### 2. `SecondWaiterSelect` erweitern (`src/components/shared/SecondWaiterSelect.tsx`)
- Gleiche Logik: optionale `restaurantId` Prop, die an `useActiveStaffByRestaurant` weitergeleitet wird

### 3. Aufrufer anpassen
Die drei Seiten, die StaffSelect/SecondWaiterSelect verwenden, muessen die `restaurantId` aus dem `RestaurantContext` durchreichen:

- **`DailySummary.tsx`** (Vorschuss-Dropdown) -- `restaurantId` aus `useRestaurant()` uebergeben
- **`WaiterCashUp.tsx`** (Kellner- und Zweitkellner-Auswahl) -- `restaurantId` uebergeben
- **`KitchenTipSplit.tsx`** (Kuechenmitarbeiter-Auswahl) -- `restaurantId` uebergeben

Der bestehende Hook `useActiveStaffByRestaurant` in `useStaff.ts` ist bereits vorhanden und muss nicht angepasst werden.

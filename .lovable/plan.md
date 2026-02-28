

## Plan: Takeaway-Prozent-Formel für Spicery anpassen

### Anforderung
Im Restaurant "Spicery" soll die Takeaway-Prozent-Berechnung nur `takeaway_total / pos_total * 100` verwenden (ohne OrderSmart und Wolt). Für andere Restaurants bleibt die bisherige Formel bestehen.

### Umsetzung

**1. ExcelLayout Props erweitern** (`src/components/daily-summary/layouts/ExcelLayout.tsx`)
- Neue optionale Prop `ordersmartInTakeaway?: boolean` hinzufügen
- In der Takeaway-Sektion die Prozentberechnung anpassen:
  - Wenn `ordersmartInTakeaway === true` (Standard): bisherige Formel `(takeaway + ordersmart + wolt) / pos * 100`
  - Wenn `ordersmartInTakeaway === false` (Spicery): nur `takeaway / pos * 100`

**2. Prop durchreichen** (`src/pages/DailySummary.tsx`)
- `ordersmartInTakeaway={restaurant?.ordersmart_in_takeaway ?? true}` an `ExcelLayout` übergeben (Variable existiert bereits in der Datei)

### Hinweis
Die Steuerung erfolgt über die bestehende Restaurant-Einstellung `ordersmart_in_takeaway`. Für Spicery steht diese auf `true` — d.h. die Logik muss invertiert sein: Wenn OrderSmart im Takeaway enthalten ist (`true`), dann ist es bereits in `takeaway_total` drin und darf **nicht** nochmal addiert werden. Die Formel wird dann `takeaway_total / pos_total * 100`.

Alternativ, falls die Einstellung für Spicery nicht passend ist, kann ein fester Slug-Check (`restaurantSlug === 'spicery'`) verwendet werden.




# Lieferplattformen Pie Chart: Doppelzählung beheben

## Problem
`takeaway_total` enthält bereits OrderSmart und Wolt. Der Pie Chart zeigt aber `takeaway_total` als "VECTRON Takeaway" und zusätzlich OrderSmart und Wolt separat -- das ist eine Doppelzählung.

## Lösung

In `src/hooks/useStatistics.ts` (Zeile 175-179): Den VECTRON-Takeaway-Anteil korrekt berechnen, indem OrderSmart und Wolt abgezogen werden.

```text
Vorher:
  takeaway_total           = 4.002,10 €  (enthält alles)
  ordersmart_revenue       =   692,02 €
  wolt_revenue             = 2.762,90 €
  SUMME                    = 7.457,02 €  (doppelt gezählt!)

Nachher:
  vectron_takeaway         =   547,18 €  (takeaway_total - ordersmart - wolt)
  ordersmart_revenue       =   692,02 €
  wolt_revenue             = 2.762,90 €
  SUMME                    = 4.002,10 €  (korrekt)
```

### Datei: `src/hooks/useStatistics.ts`

Zeile 175-179 anpassen:

```typescript
const totalTakeaway = (sessions || []).reduce((sum, s) => sum + (s.takeaway_total || 0), 0);
const totalOrdersmart = (sessions || []).reduce((sum, s) => sum + (s.ordersmart_revenue || 0), 0);
const totalWolt = (sessions || []).reduce((sum, s) => sum + (s.wolt_revenue || 0), 0);
const vectronTakeaway = totalTakeaway - totalOrdersmart - totalWolt;

const deliveryBreakdown: DeliveryBreakdown[] = [
  { name: 'takeaway_total', value: Math.max(0, vectronTakeaway) },
  { name: 'ordersmart_revenue', value: totalOrdersmart },
  { name: 'wolt_revenue', value: totalWolt },
].filter(d => d.value > 0);
```

Keine weiteren Dateien betroffen -- das Label "VECTRON Takeaway" kommt aus `useLabels` und ist bereits korrekt.


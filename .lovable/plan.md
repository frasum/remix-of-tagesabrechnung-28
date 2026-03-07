

## Plan: BARGELD durch Kreditkarten ersetzen im Umsatz-Chart

### Kontext
Der Nutzer möchte im Umsatzentwicklungs-Chart statt "BARGELD" die "Kreditkarten" sehen. Kreditkarten beinhaltet: Terminal 1 + Terminal 2 + Wolt + OrderSmart (alles Unbar).

### Änderungen

**1. `src/hooks/useStatistics.ts`**
- `DailyStats` Interface: `bargeld` durch `kreditkarten` ersetzen
- In der `dailyStats.map()`: Statt Bargeld die Summe berechnen:
  ```
  kreditkarten = terminal_1_total + terminal_2_total + ordersmart_revenue + wolt_revenue
  ```
- Dafür müssen die Session-Felder `terminal_1_total`, `terminal_2_total`, `ordersmart_revenue`, `wolt_revenue` in die map-Funktion durchgereicht werden (sind bereits im Select enthalten)

**2. `src/pages/Statistics.tsx`**
- Im Chart: `dataKey="bargeld"` → `dataKey="kreditkarten"`, `name="BARGELD"` → `name="Kreditkarten"`
- Gradient-ID umbenennen: `colorBargeld` → `colorKreditkarten`
- `chartData` mapping anpassen falls nötig


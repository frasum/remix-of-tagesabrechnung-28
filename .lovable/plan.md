
# Kellner-Status erweitern: Umsatz, Abgabezeit und TG %

## Uebersicht
Die "Kellner-Status"-Karte in der Tagesabrechnung wird um drei zusaetzliche Informationen pro Kellner erweitert:
1. **Umsatz** (pos_sales) - wie viel der Kellner kassiert hat
2. **Abgabezeit** (submitted_at) - wann die Abrechnung eingereicht wurde (ist bereits vorhanden, wird aber auf Mobile ausgeblendet - das wird geaendert)
3. **TG %** - Trinkgeld-Prozentsatz (Pool-Anteil / Umsatz)

## Aenderung

**Datei: `src/pages/DailySummary.tsx`** (Bereich `waiterStatusComponent`, ca. Zeile 890-931)

Jede Kellner-Zeile wird von einer einfachen einzeiligen Anzeige zu einer zweizeiligen Darstellung erweitert:

**Zeile 1:** Name + Status-Badge (wie bisher)
**Zeile 2:** Umsatz | TG % | Abgabezeit

### Berechnung TG %
- Pool-Anteil pro Kellner (`tipPerWaiter`) ist bereits berechnet
- TG % = `tipPerWaiter / pos_sales * 100`
- Bei Team-Schichten (second_waiter_name): Anteil wird verdoppelt (2 Shares)
- Falls Kellner nicht am Pool teilnimmt: "---" anzeigen
- Falls pos_sales = 0: "---" anzeigen

### Layout-Skizze pro Kellner
```text
┌─────────────────────────────────────────────────┐
│ Max Mustermann                    [OK] 14:32    │
│ Umsatz: 1.234,00 EUR    TG: 3,2%               │
└─────────────────────────────────────────────────┘
```

## Technische Details

Nur eine Datei wird geaendert: `src/pages/DailySummary.tsx`

- Die Variable `tipPerWaiter` ist bereits im Scope verfuegbar (Zeile 218)
- `submitted_at` wird bereits gelesen (Zeile 901), aber mit `hidden sm:inline` auf Mobile versteckt - das wird entfernt
- Fuer jeden Kellner wird der individuelle TG % berechnet:

```typescript
const shares = shift.second_waiter_name ? 2 : 1;
const waiterPoolShare = shift.participates_in_pool ? tipPerWaiter * shares : 0;
const posSales = shift.pos_sales || 0;
const tipPercent = posSales > 0 && shift.participates_in_pool
  ? (waiterPoolShare / posSales) * 100
  : null;
```

- Umsatz wird als Waehrung formatiert (`de-DE`, EUR)
- TG % wird mit einer Nachkommastelle angezeigt (z.B. "3,2%")
- Abgabezeit wird auch auf Mobile angezeigt (entfernen von `hidden sm:inline`)

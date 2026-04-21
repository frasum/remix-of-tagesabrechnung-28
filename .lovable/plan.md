

# Trinkgeld-Berechnung korrigieren: kassiert_brutto statt pos_sales

## Problem
Bei Tisch-Transfers weicht `kassiert_brutto` (was der Kellner tatsächlich kassiert) von `pos_sales` (was er boniert hat) ab. Die Expected-Cash-Berechnung verwendet fälschlicherweise `pos_sales`, was zu falschen Trinkgeld-Werten führt — bei Joy am 7. April sogar ein Minus von -59,54 € statt korrekt +5,46 €.

## Betroffene Dateien (6 Stellen)

| Datei | Zeile | Aktuell | Fix |
|-------|-------|---------|-----|
| `src/pages/DailySummary.tsx` | 252 | `w.pos_sales` | `w.kassiert_brutto` |
| `src/pages/WaiterCashUp.tsx` | 215 | `shift.pos_sales` | `shift.kassiert_brutto` |
| `src/pages/WaiterMobile.tsx` | 82 | `formData.pos_sales` | `formData.kassiert_brutto` |
| `src/hooks/useStatistics.ts` | 225 | `shift.pos_sales` | `shift.kassiert_brutto` |
| `src/hooks/useStatisticsComparison.ts` | 80 | `shift.pos_sales` | `shift.kassiert_brutto` |
| `src/hooks/useMonthlyStaffTips.ts` | 136 | `s.pos_sales` | `s.kassiert_brutto` |
| `src/hooks/useWaiterRanking.ts` | 69 | `shift.pos_sales` | `shift.kassiert_brutto` |
| `src/hooks/useSession.ts` | 594 | `shift.pos_sales` | `shift.kassiert_brutto` |

`ExcelLayout.tsx` verwendet bereits korrekt `kassiert_brutto` — keine Änderung nötig.

## Wichtig
- `pos_sales` bleibt weiterhin für die **Leistungs-Anzeige** und **TG%-Berechnung** (Performance-Kennzahl) erhalten
- Nur die **Expected-Cash-Formel** wird umgestellt: `kassiert_brutto + hilf_mahl - open_invoices - card_total`
- Das betrifft die Bargeld-Soll-Berechnung und damit Trinkgeld, Differenz und Pool-Berechnung

## Kein Datenbank-Änderung nötig
Reine Code-Änderung in 8 Dateien, jeweils eine Zeile.


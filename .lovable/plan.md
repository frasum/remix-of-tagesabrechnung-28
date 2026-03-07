

# Tägliche Provision in Tagesdetails anzeigen

## Ziel
Neue Spalte **"Prov. (€)"** in der Tagesdetails-Tabelle, die den tatsächlichen Provisionsbetrag pro Tag zeigt.

## Änderungen in `src/pages/zeiterfassung/ZtProvision.tsx`

1. **DayBreakdown-Typ erweitern**: Neues Feld `commission: number`

2. **dailyBreakdown-Memo**: Die Tages-Provision wird bereits in `result` berechnet (Zeilen 414-423). Stattdessen die Berechnung direkt in `dailyBreakdown` integrieren oder nachträglich zuweisen. Da `dailyBreakdown` vor `result` kommt, berechne ich die Provision inline im Rendering:
   - `dayAvg >= minRevenue` → `excess = revenue - (minRevenue * staffCount)` → `commission = excess * (commissionPct / 100)`
   - Sonst: `commission = 0`

3. **Tabelle**: Neue Spalte "Prov. (€)" nach "Ø €/h (alle)" — zeigt den Provisionsbetrag des Tages, grün wenn > 0, grau wenn 0.

4. **Footer**: Summe aller Tagesprovisionen (= Provisions-Topf).

Keine DB-Änderungen nötig. Die Berechnung nutzt die bereits vorhandenen `minRevenue` und `commissionPct` Werte.



# Fix: SoUse (Sonstige Einnahmen) wird doppelt gezaehlt

## Problem
`sonstige_einnahme` ist bereits im Vectron-Gesamtumsatz (`pos_total`) enthalten. Aktuell wird es in der BARGELD-Formel nochmals addiert (`pos_total + sonstige_einnahme`), was zu einer **doppelten Zaehlung** fuehrt und das berechnete Bargeld zu hoch ausweist.

## Loesung
`sonstige_einnahme` aus der Addition in der BARGELD-Formel entfernen. Es bleibt weiterhin als Eingabefeld sichtbar (zur Dokumentation), wird aber nicht mehr in die Berechnung einbezogen, da es bereits ueber `pos_total` erfasst ist.

## Betroffene Dateien (5 Stellen)

### 1. `src/pages/DailySummary.tsx` (Zeile ~268)
- `+ formData.sonstige_einnahme` aus der BARGELD-Berechnung entfernen

### 2. `src/hooks/useCashBalanceData.ts` (Zeile ~75)
- `+ sonstigeEinnahme` aus der bargeld-Berechnung entfernen

### 3. `src/hooks/usePreviousDayDeficit.ts` (Zeile ~75)
- `+ sonstigeEinnahme` aus der bargeld-Berechnung entfernen

### 4. `src/hooks/useStatistics.ts` (Zeile ~148)
- `+ (session.sonstige_einnahme || 0)` aus der bargeld-Berechnung entfernen

### 5. `src/pages/ManagerDashboard.tsx` (Zeile ~234)
- `+ formData.sonstige_einnahme` aus der bargeld-Berechnung entfernen

## Was sich NICHT aendert
- Das Eingabefeld "Sonstige Einnahmen" bleibt bestehen (zur Dokumentation)
- Der Wert wird weiterhin in der Datenbank gespeichert
- Die Anzeige im Excel-Layout und PDF bleibt sichtbar
- Nur die rechnerische Einbeziehung in die BARGELD-Formel wird entfernt

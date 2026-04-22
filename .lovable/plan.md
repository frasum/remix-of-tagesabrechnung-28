
# Tagesabrechnung: Fehlbetrag Vortag von Bargeldbestand entkoppeln

## Was gerade schief läuft
Der angezeigte Wert `-6.078,42 €` passt nicht zur isolierten Tageslogik. Für den gezeigten Fall wäre der operative Vortagsfehlbetrag nur der **unmittelbare Vortageswert**, nicht ein kumulierter Alt-Saldo.

Die Ursache ist sehr wahrscheinlich, dass die Tagesabrechnung ihren `previousDeficit` noch indirekt aus der Bargeldbestand-Datenkette ableitet. Damit kann ein alter kumulierter Übertrag in die Tagesabrechnung „durchsickern“, obwohl diese fachlich separat sein soll.

## Ziel
Die Tagesabrechnung soll den **Fehlbetrag des direkten vorherigen Tages mit Daten** berechnen — unabhängig von:
- kumuliertem Bargeldbestand
- Bankeinzahlungen
- Tresor-/Kassentransfers
- historischen Überträgen aus früheren Wochen

Formel für Tagesabrechnung:
```text
previousDeficit = min(0, rawTagesBargeld(vorheriger Tag mit Daten))
```

## Umsetzung

### 1) `usePreviousDayDeficit` fachlich neu aufbauen
Datei: `src/hooks/usePreviousDayDeficit.ts`

Den Hook nicht mehr auf `useCashBalanceData()` aufsetzen, sondern direkt aus den Tagesabrechnungs-Daten berechnen:

- vorherigen Tag mit Session für das Restaurant ermitteln
- für genau diesen Tag laden:
  - `sessions`
  - `waiter_shifts.open_invoices`
  - `expenses.amount`
  - `advances.amount`
- daraus **standalone raw Tages-Bargeld** berechnen:
```text
pos_total
+ vouchers_sold
+ sonstige_einnahme
- terminal_1_total
- terminal_2_total
- ordersmart_revenue
- wolt_revenue
- vouchers_redeemed
- finedine_vouchers
- einladung
- offene_rechnungen
- vorschuesse
- ausgaben
```
- Rückgabe nur als negativer Wert, sonst `0`

Zusätzlich Rückgabe erweitern um:
- `sourceDate` des verwendeten Vortags
- optional `rawPreviousDay`

Damit ist transparent, welcher Tag wirklich herangezogen wurde.

### 2) Daily Summary auf die neue Hook-Semantik umstellen
Datei: `src/pages/DailySummary.tsx`

- `previousDeficit` weiter für `bargeld`, `diffWechselgeld`, `todaySkimAmount` verwenden
- Variable/Kommentare sprachlich bereinigen, damit klar ist:
  - das ist **kein kumulativer Carry**
  - das ist **nur der isolierte operative Vortagsfehlbetrag**

### 3) Anzeige verständlicher machen
Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`

Die Zeile klarer beschriften, z. B.:
```text
Fehlbetrag Vortag (20.04.)
```
oder kleiner Zusatztext:
```text
bezogen auf letzten Tag mit Daten
```

So ist sofort sichtbar:
- welcher Tag gemeint ist
- dass nicht ein alter Monatssaldo angezeigt wird

## Optional sinnvolle Absicherung
Wenn kein Vortag gefunden wird:
- kein Fehler
- `previousDeficit = 0`
- Zeile bleibt ausgeblendet

## Betroffene Dateien
- `src/hooks/usePreviousDayDeficit.ts`
- `src/pages/DailySummary.tsx`
- `src/components/daily-summary/layouts/ExcelLayout.tsx`

## Nicht betroffen
- `src/pages/CashBalance.tsx`
- `src/hooks/useCashBalanceData.ts`
- `compute_carry_over`
- Bankeinzahlungen / Kassentransfers im Bargeldbestand

## Erwartetes Ergebnis
Für den gezeigten Fall erscheint **nicht mehr** `-6.078,42 €`, sondern nur der echte isolierte Fehlbetrag des direkten Vortags mit Daten.  
Die Tagesabrechnung bleibt damit fachlich sauber getrennt vom kumulierten Bargeldbestand.

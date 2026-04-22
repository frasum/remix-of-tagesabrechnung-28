

# Bargeldbestand: Vortagsfehlbetrag in Tagesspalte sichtbar machen

## Ursache der Verwirrung
Beide Zahlen sind technisch korrekt, messen aber Unterschiedliches:

| Ansicht | Wert für 21.04. | Bedeutung |
|---|---|---|
| Tagesabrechnung „in den Tresor legen" | **193,21 €** | Tageseffekt **nach** Verrechnung des Vortagsfehlbetrags (230,43 − 37,22) |
| Bargeldbestand Spalte „Bargeld" | **230,43 €** | reiner Tageseffekt 21.04., **ohne** Vortag |

Das vom 20.04. übrige Minus (−37,22 €) wird auf der Bargeldbestand-Seite zwar in der laufenden Kette berücksichtigt, ist in der Tageszeile selbst aber **unsichtbar** — daher der Eindruck, der Bargeldbestand stimme nicht.

## Lösung
Die Spalte „Bargeld" in der Bargeldbestand-Tabelle wird so erweitert, dass sie **denselben Wert wie der Tresor in der Tagesabrechnung** zeigt:

```
Bargeld(Tag) = rawBargeld(Tag) + min(0, rawBargeld(Vortag))
```

Konkret für den 21.04.:
- rawBargeld 21.04. = 230,43 €
- Vortagsfehlbetrag (20.04.) = −37,22 €
- Anzeige neu: **193,21 €**

Wenn der Vortag im Plus war oder kein Vortag existiert, ändert sich nichts (z. B. 19.04. bleibt unverändert).

## UI-Detail
- Bei Tagen mit Vortagsfehlbetrag: kleines Tooltip/Subtext mit Aufschlüsselung: „230,43 € Tageskasse − 37,22 € Vortag = 193,21 €". So bleibt nachvollziehbar, woher die Zahl kommt.
- Farbe: weiterhin rot bei < 0, grün bei > 0, neutral bei 0.

## Auswirkungen auf andere Werte
- **GESAMT-Spalte „Bargeld"** in der Monatssumme: bleibt unverändert (kumuliert weiterhin die rohen Tageswerte, weil die Vortagsfehlbeträge sich innerhalb des Monats ohnehin verkettet aufheben — Doppelzählung würde sonst entstehen). Nur die einzelne **Tageszelle** zeigt den ausgeglichenen Wert.
- **Übertrag/kumulative Kette** (interne `previousCarry`, `chainedBargeld`, `remainingCash`): unverändert, da sie auf `rawBargeld` basieren.
- **Excel/PDF-Export**: bekommen denselben Anzeige-Wert, damit Bildschirm und Export übereinstimmen.

## Betroffene Dateien
- `src/hooks/useCashBalanceData.ts` — neues Feld `displayBargeld = rawBargeld + min(0, prevRawBargeld)` pro Zeile (additive Erweiterung, keine bestehenden Felder umdefinieren).
- `src/pages/CashBalance.tsx` — Tagesspalte „Bargeld" zeigt `displayBargeld`; Tooltip mit Aufschlüsselung bei Vortagsfehlbetrag; GESAMT-Zelle bleibt Summe der `rawBargeld`.
- `src/utils/excelExport.ts` — Tageszeilen nutzen `displayBargeld`, Summenzeile `rawBargeld`.
- `src/lib/exportBuchhaltungPdf.ts` — analog (falls dort die Tagesspalte gerendert wird; sonst entfällt).

## Nicht betroffen
- Tagesabrechnung (`DailySummary.tsx`, `ExcelLayout.tsx`) — funktioniert bereits korrekt.
- `useRemainingCash`, `usePreviousDayDeficit` — bleiben wie sind.
- Server-Funktion `compute_carry_over` — unverändert.

## Erwartetes Ergebnis
- Spalte „Bargeld" am 21.04. zeigt **193,21 €** (mit Tooltip zur Erklärung) statt 230,43 €.
- Tagesabrechnung und Bargeldbestand zeigen damit denselben Wert für „heute in den Tresor".
- Monatssumme im Footer bleibt mathematisch korrekt.


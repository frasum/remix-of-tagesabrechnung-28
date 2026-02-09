
# PDF-Export Anpassungen: Datum groesser, Bargeld-Feld schwarz-weiss, Tabelle zentriert

## Aenderungen

### 1. Datum groesser und fett
Das Datum wird von 18pt normal auf **24pt bold** erhoeht, damit es deutlich prominenter ist.

### 2. Bargeld-Zeile: Schwarz-weiss statt gruen
Da ein Schwarz-Weiss-Drucker verwendet wird, wird die gruene Hintergrundfarbe (`fillColor: [220, 252, 231]`) entfernt. Stattdessen bekommt die Zeile:
- Weisser Hintergrund
- Schwarzer Rahmen drumherum
- Etwas groessere Schrift (11pt statt 9pt)

### 3. Tabelle mittig auf der Seite
Die Tabelle wird horizontal zentriert, indem der linke Margin dynamisch berechnet wird:
`marginLeft = (pageWidth - tableWidth) / 2`

Aktuell ist die Tabelle linksbuendig mit `margin: { left: 14 }`. Neu wird sie mittig gesetzt.

## Technische Umsetzung

In `src/utils/pdfExport.ts`:

| Zeile | Aenderung |
|-------|-----------|
| 87-88 | Datum: `setFontSize(24)` + `setFont('helvetica', 'bold')` |
| 125 | `tableWidth` bleibt bei 55%, aber margins werden zentriert: `const tableMarginLeft = (pageWidth - tableWidth) / 2` |
| 146-148 | Bargeld-Zeile: `fillColor` entfernen, stattdessen `lineWidth` und `lineColor` fuer schwarzen Rahmen verwenden |
| 150-158 | autoTable margin links/rechts auf zentrierte Werte setzen |
| 165-169 | "ohne hilfmahl" ebenfalls zentriert positionieren |
| 174-193 | Ausgaben-Tabelle ebenfalls zentriert |

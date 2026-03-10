

## Vorschuss-Quittungsseiten im PDF-Export

### Was wird gebaut
Nach der Hauptseite der Tagesabrechnung wird für jeden Vorschuss eine eigene Seite generiert — eine Quittung, die der Mitarbeiter unterschreiben kann.

### Layout jeder Quittungsseite
- Restaurant-Name + Datum (Header)
- "Vorschussquittung" als Titel
- Mitarbeitername und Betrag (groß, prominent)
- Textblock: "Hiermit bestätige ich, den oben genannten Vorschuss erhalten zu haben."
- Unterschriftszeile mit Linie und "Datum, Unterschrift"

### Technische Änderung

**Datei: `src/utils/pdfExport.ts`** — in `generateDailySummaryPDF`, nach dem Footer-Loop (Zeile ~418), vor der Blob-Erstellung:

Für jeden Eintrag in `data.advances`:
1. `doc.addPage()`
2. Zentrierter Header mit Restaurant + Datum
3. Titel "Vorschussquittung"
4. Name und Betrag in großer Schrift
5. Bestätigungstext
6. Unterschriftslinie unten

Die Seitenzahlen im Footer-Loop müssen danach nochmal aktualisiert werden (der Loop läuft über `doc.getNumberOfPages()`), daher wird der Footer-Loop nach dem Hinzufügen der Quittungsseiten ausgeführt.


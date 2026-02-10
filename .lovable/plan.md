

## PDF-Export auf eine Seite zusammenfuehren

Aktuell wird die Kellner-Tabelle auf einer separaten Seite 2 gedruckt (`doc.addPage()`). Alles soll auf eine einzige Seite passen.

### Aenderungen in `src/utils/pdfExport.ts`

1. **`doc.addPage()` entfernen** (Zeile 240) -- die Kellner-Tabelle wird direkt nach den Ausgaben/Vorschuss-Tabellen auf derselben Seite weitergeschrieben

2. **Schriftgroessen und Abstaende kompakter machen**, damit alles auf eine Seite passt:
   - Header: Restaurantname von 28pt auf 20pt, Datum von 24pt auf 16pt
   - Zeilenabstaende zwischen Sektionen reduzieren
   - Summary-Tabelle: `cellPadding` verkleinern
   - Die leere Spacer-Zeile (`['', '']`) entfernen

3. **Tabellenbreite auf volle Seitenbreite** statt 55% -- damit Kellner-Tabelle und Summary nebeneinander oder zumindest platzsparender dargestellt werden

4. **Seitennummerierung** bleibt bestehen, zeigt dann "Seite 1 von 1"

### Ergebnis

Ein einziges Blatt mit:
- Header (Name + Datum)
- Warnungen (falls vorhanden)
- Zusammenfassung (Umsatz, KK, etc. bis Bargeld)
- Ausgaben und Vorschuss (falls vorhanden)
- Kellner-Tabelle mit Trinkgeld-Infos


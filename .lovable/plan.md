

## PDF-Layout: Zwei-Spalten-Anordnung

### Idee

Analog zur Web-Ansicht (ExcelLayout) werden die Daten im PDF nebeneinander angeordnet statt untereinander:

```text
+---------------------------+---------------------------+
| LINKE SPALTE              | RECHTE SPALTE             |
+---------------------------+---------------------------+
| Umsatz                    | Kellner-Details           |
|   POS-Umsatz    1.234 EUR |   Name  Umsatz  TG  TG%  |
|   Gaeste: 45    oe 27 EUR |   ...                     |
|                           |                           |
| Kartenzahlung             | Trinkgeld-Aufschluesselung|
|   KK (Terminal)   800 EUR |   Kellner-TG    xxx EUR   |
|                           |   Kuechen-TG    xxx EUR   |
| Take Away                 |                           |
|   SoUse           100 EUR | Ausgaben (falls vorhanden)|
|   Wolt             50 EUR |   Beschreibung  Betrag    |
|                           |   ...                     |
| Gutscheine & Abzuege      |                           |
|   Gutscheine EL     0 EUR | Vorschuss (falls vorh.)   |
|   ...                     |   Name          Betrag    |
|                           |                           |
| Ergebnis                  | Notizen                   |
|   Tages-Bargeld   535 EUR |   Freitext...             |
|   HilfMahl          0 EUR |                           |
|   Differenz...    535 EUR |                           |
|   Wechselgeldbestand      |                           |
+---------------------------+---------------------------+
```

### Vorteile

- Kompakteres Layout, mehr Informationen auf einen Blick
- Konsistent mit der Web-Ansicht
- Bessere Nutzung der Seitenbreite (A4 bietet genug Platz)

### Aenderungen im Detail

#### Linke Spalte (ca. 45% Breite)
Zusammenfassung mit Sektions-Headern (wie gerade implementiert):
- Umsatz, Kartenzahlung, Take Away, Gutscheine & Abzuege, Ergebnis
- Wechselgeldbestand-Zeile am Ende

#### Rechte Spalte (ca. 55% Breite)
- Kellner-Details-Tabelle
- Trinkgeld-Aufschluesselung
- Ausgaben-Tabelle (falls vorhanden)
- Vorschuss-Tabelle (falls vorhanden)
- Notizen (falls vorhanden)

### Technische Umsetzung

| Datei | Aenderung |
|---|---|
| `src/utils/pdfExport.ts` | Zeilen ~148-400: Layout-Umbau auf zwei parallele Spalten |

- Seitenbreite wird in zwei Haelften geteilt: `leftColWidth = tableWidth * 0.45`, `rightColWidth = tableWidth * 0.55`
- Linke Spalte: `autoTable` mit `margin.left = margin`, `tableWidth = leftColWidth`
- Rechte Spalte: `autoTable` mit `margin.left = margin + leftColWidth + gap`, `tableWidth = rightColWidth`
- Beide Spalten starten auf gleicher Y-Position (`startY`)
- Nach beiden Spalten wird `y = Math.max(leftEndY, rightEndY)` gesetzt fuer nachfolgende Inhalte (Abschnitt zum Ausschneiden)
- Die bestehenden Sektions-Header und Formatierungen bleiben erhalten


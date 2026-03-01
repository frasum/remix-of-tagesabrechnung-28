

## Wechselgeldbestand prominent unter Trennlinie im PDF

### Was sich aendert

Der Wechselgeldbestand bleibt in der linken Spalte bestehen (nichts wird entfernt), aber **zusaetzlich** wird nach dem Spalten-Merge (Zeile 363) eine prominente, seitenbreite Sektion eingefuegt:

### Aenderung in `src/utils/pdfExport.ts` (nach Zeile 363)

1. **Trennlinie**: Horizontale Linie ueber die gesamte Seitenbreite (`margin` bis `pageWidth - margin`), damit der untere Teil abgetrennt und in die Kasse gelegt werden kann.

2. **Grosser zentrierter Wechselgeldbestand**: Darunter mit Schriftgroesse 16pt, fett und zentriert der Text "Wechselgeldbestand: €X.XXX,XX" mit farbigem Hintergrund (gruen ab 2.000 EUR, rot darunter).

3. **Nichts wird entfernt** – die bestehende kleine Darstellung in der linken Spalte bleibt erhalten.

### Betroffene Datei
- `src/utils/pdfExport.ts` – nur Einfuegung nach Zeile 363, vor dem Footer-Block.


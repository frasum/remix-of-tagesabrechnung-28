

## Plan: Darstellung der Tagesdetails-Tabelle verbessern

Basierend auf dem Screenshot soll die Tabelle visuell aufgewertet werden. Die aktuelle Darstellung nutzt die Standard-`Table`-Komponente mit kompaktem Padding. Der Screenshot zeigt eine luftigere Tabelle mit besserer Lesbarkeit.

### Änderungen in `src/pages/zeiterfassung/ZtProvision.tsx`

1. **Größeres Zeilenpadding** — `TableCell` und `TableHead` erhalten mehr vertikalen Abstand (`py-4` statt Standard `p-4`), damit die Zeilen luftiger wirken wie im Screenshot.

2. **Tausender-Trennung bei Umsatz** — Die Werte wie `5710,00` werden bereits korrekt mit `toLocaleString("de-DE")` formatiert. Prüfen, ob alle Spalten konsistent formatiert sind.

3. **Datum linksbündig fett** — Ist bereits so. ✓

4. **"Ø €/h Umsatz gesamtes Team" mit € Suffix** — Bereits vorhanden. ✓

5. **Provision 0,00 in grauer Farbe, positive in grün** — Bereits implementiert. ✓

6. **Footer-Zeile visuell stärker abgesetzt** — Dickeren oberen Rand (`border-t-2`) für die Gesamt-Zeile.

7. **Spaltenbreiten optimieren** — Mit `colgroup` oder `min-w`-Klassen die Spalten gleichmäßiger verteilen, damit die Tabelle die volle Breite nutzt wie im Screenshot.

8. **Tabelle `table-fixed` Layout** — Damit Spaltenbreiten gleichmäßig verteilt werden.

### Betroffene Datei
- `src/pages/zeiterfassung/ZtProvision.tsx` (Tagesdetails-Tabelle, Zeilen 517–618)


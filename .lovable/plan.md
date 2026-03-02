

## CSV-Export für das Lohnbüro-Portal

Alle drei Tabs (Wochenplan, Zusammenfassung, Buchhaltung) im PayrollPortal bekommen einen zusätzlichen CSV-Export-Button neben den bestehenden PDF/Excel-Buttons.

### Neue Datei: `src/lib/exportCsv.ts`

Utility-Funktion `downloadCsv(filename, headers, rows)` die:
- Header-Zeile + Datenzeilen als CSV formatiert (Semikolon-getrennt für deutsche Excel-Kompatibilität)
- Zahlen mit Komma als Dezimaltrennzeichen
- UTF-8 BOM voranstellt (damit Excel Umlaute korrekt anzeigt)
- Als `.csv`-Datei herunterlädt

### Drei Export-Funktionen in `src/lib/exportCsv.ts`

1. **`exportBuchhaltungCsv`** — Spalten: Mitarbeiter, Abteilung, Gesamt Std., Schichten, So/Fei, 20-24, 24-x, Urlaub, Krank, Vorschuss, Besonderheiten
2. **`exportZusammenfassungCsv`** — Spalten: Mitarbeiter, Abteilung, W1..Wn (dynamisch), Gesamt, Schichten, So/Fei, 20-24, 24-x, U, K
3. **`exportWochenplanCsv`** — Spalten: Mitarbeiter, Abteilung, dann pro Tag (Mo-So): Von, Bis, Stunden, Abwesenheit

### Änderungen in `src/pages/shared/PayrollPortal.tsx`

- Import der drei CSV-Funktionen
- Je Tab einen dritten Button mit `FileDown`-Icon und Label "CSV" neben PDF/Excel einfügen
- Gleiche Daten wie bei den bestehenden Excel-Exporten übergeben


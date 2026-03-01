

## Export-Funktion für den Wochenplan

Export der Arbeitszeiten der aktuellen Periode als PDF und Excel direkt aus dem Wochenplan.

### Ansatz

Die Buchhaltung hat bereits einen PDF-Export (`exportBuchhaltungPdf`). Für den Wochenplan wird ein neuer Export erstellt, der die Daten tabellarisch nach Woche und Tag aufschlüsselt — ähnlich der Wochenplan-Ansicht im UI.

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/lib/exportWochenplanPdf.ts` | **Neu.** PDF-Export im Querformat: Tabelle mit Mitarbeitern als Zeilen, Tagen als Spalten (Start/Ende pro Tag), gruppiert nach Abteilung. Summenspalten für Gesamt, So/Fei, Abend, Nacht, U, K. Eine Seite pro Woche der Periode. |
| `src/lib/exportWochenplanExcel.ts` | **Neu.** Excel-Export mit einem Sheet pro Woche. Gleiche Struktur wie PDF: Mitarbeiter × Tage mit Start/Ende-Zeiten, Abteilungs-Gruppierung, Summenspalten. |
| `src/pages/zeiterfassung/ZtWochenplan.tsx` | Export-Buttons (PDF / Excel) in die Toolbar einfügen. Buttons nutzen `allPeriodShifts` (bereits geladen) + `employees` + `weeks` aus dem Context. |

### Datenfluss

Alle benötigten Daten sind bereits im Wochenplan verfügbar:
- `allPeriodShifts` — alle Schichten der gesamten Periode
- `employees` — Mitarbeiterliste mit Abteilung
- `weeks` — Wochendefinitionen der Periode
- `holidays` — Feiertage für Markierung
- Perioden-Label aus `periods` / `selectedPeriodId`

### PDF-Layout (Querformat A4)

```text
Wochenplan – März 2026 – Woche 1 (26.02. – 04.03.)

               Mo 26.02.  Di 27.02.  Mi 28.02.  ...  So 04.03.  | Ges   So/F  20-24  24-x  U  K
─────────────────────────────────────────────────────────────────────────────────────────────────
KÜCHE
  Lam          10-22      10-22      —          ...  —           | 48,00  0,00  8,00   0,00  0  0
  ...
GL
  ...
SERVICE
  ...
```

### Excel-Layout

Ein Sheet pro Woche, gleiche Spaltenstruktur. Sheet-Name: "W1", "W2", etc.


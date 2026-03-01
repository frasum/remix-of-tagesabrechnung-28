

## Plan: Excel-Export für Buchhaltung hinzufügen

Die Buchhaltungsseite hat bereits einen PDF-Export. Es fehlt ein Excel-Export. Der bestehende PDF-Button wird in eine Zweier-Gruppe (PDF + Excel) umgewandelt, analog zur Zusammenfassung.

### 1. Neue Datei `src/lib/exportBuchhaltungExcel.ts`

- Ein Sheet "Buchhaltung" mit gleicher Struktur wie die PDF-Tabelle
- Spalten: Mitarbeiter | Gesamt Std. | Schichten | So/Fei Std. | 20-24 Std. | 24-x Std. | U (angr.) | K | Vorschuss | Besonderheiten
- Abteilungs-Header als eigene Zeilen
- Numerische Werte als Zahlen (rechenbar in Excel)
- Parameter: `periodLabel`, `employees`, `shifts`, `payrollNotes` (identisch zum PDF-Export)

### 2. Änderung in `src/pages/zeiterfassung/ZtBuchhaltung.tsx`

- Import `exportBuchhaltungExcel` + `FileSpreadsheet` Icon
- Bestehenden PDF-Button beibehalten, daneben einen neuen Excel-Button hinzufügen
- Beide Buttons in einer `div`-Gruppe mit `gap-2`


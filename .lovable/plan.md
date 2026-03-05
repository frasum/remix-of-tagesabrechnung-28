

## Plan: §3b-Modus für Lohnbüro-Buchhaltungstabelle

### Problem
Die `PayrollBuchhaltungTab` in `PayrollPortal.tsx` nutzt immer den einfachen Modus — `sfnMode` wird weder gelesen noch an `BuchhaltungTableHead`, `BuchhaltungDeptHeader`, `BuchhaltungFooter` oder die Datenzeilen weitergegeben. So/Fei wird immer als eine Spalte dargestellt.

### Umsetzung

**Datei: `src/pages/shared/PayrollPortal.tsx`**

1. **`useSfnMode` importieren** und im `PayrollBuchhaltungTab` aufrufen
2. **SFN-Modus-Toggle** hinzufügen (wie in der Buchhaltung-Seite — einfacher Toggle-Button in der Toolbar neben den Export-Buttons)
3. **`sfnMode` durchreichen** an:
   - `BuchhaltungTableHead` (Zeile 993)
   - `BuchhaltungDeptHeader` (Zeile 1022)
   - `BuchhaltungFooter` (Zeile 1062)
4. **Datenzeilen anpassen** (Zeilen 1030–1032): Im Extended-Modus statt einer `soFeiStunden`-Spalte zwei getrennte Spalten (`sonntagStunden`, `feiertagStunden`) rendern — analog zu `BuchhaltungRow.tsx`
5. **`getEmployeeTotals` mit `additive`-Flag** aufrufen: `getEmployeeTotals(emp.id, shifts, emp.department, sfnMode === "extended")`
6. **Grand Totals** ebenfalls mit `additive`-Flag berechnen
7. **Export-Funktionen** `sfnMode` übergeben (die Funktionen unterstützen es bereits)

### Auch betroffen: Zusammenfassungs-Tab (Zeilen 893–943)
Die Zusammenfassungs-Tabelle (`PayrollSummaryTab`) hat dieselben SFN-Spalten (Zeilen 929–931) und braucht dieselbe Anpassung. Der sfnMode-Toggle wird einmal oben im Portal angezeigt und gilt für beide Tabs.




# FineDine-Feld pro Restaurant ausblenden

## Ziel
Das Feld "FineDine" soll fuer das Restaurant YUM ausgeblendet werden koennen, waehrend es in anderen Restaurants weiterhin sichtbar bleibt. Die Loesung soll flexibel sein, damit zukuenftig auch andere Felder pro Restaurant ein-/ausgeblendet werden koennen.

## Ansatz
Das bestehende Settings-System wird um einen neuen Key `hidden_fields` erweitert. Dort wird pro Restaurant eine Liste von `LabelKey`-Werten gespeichert (z.B. `["finedine_vouchers"]`). Der bestehende `useLabels`-Hook wird erweitert, um auch diese Information bereitzustellen.

## Aenderungen

### 1. Hook erweitern (`src/hooks/useLabels.ts`)
- Neuen Settings-Key `hidden_fields` laden (gleiche `settings`-Tabelle)
- Neue Funktion `isFieldHidden(key)` bereitstellen
- Neue Mutation `saveHiddenFields` zum Speichern

### 2. UI-Integration (`src/components/daily-summary/layouts/ExcelLayout.tsx`)
- FineDine-Zeile nur rendern, wenn `isFieldHidden('finedine_vouchers')` false ist
- Das Feld erhaelt dann automatisch den Wert 0

### 3. Einstellungs-UI (`src/components/settings/LabelSettings.tsx`)
- Pro Feld einen kleinen Toggle (Auge-Symbol) neben dem Label-Input hinzufuegen
- Toggle steuert, ob das Feld angezeigt oder ausgeblendet wird

### 4. Exporte anpassen
- `src/utils/pdfExport.ts` - FineDine-Zeile nur einfuegen wenn nicht hidden
- `src/utils/excelExport.ts` - FineDine-Spalte nur einfuegen wenn nicht hidden

### 5. DailySummary weiterreichen (`src/pages/DailySummary.tsx`)
- `hiddenFields`-Liste an ExcelLayout und Export-Funktionen weiterreichen

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/hooks/useLabels.ts` | `hidden_fields` laden, `isFieldHidden()` und `saveHiddenFields` bereitstellen |
| `src/components/settings/LabelSettings.tsx` | Toggle pro Feld zum Ein-/Ausblenden |
| `src/components/daily-summary/layouts/ExcelLayout.tsx` | Bedingte Anzeige von FineDine |
| `src/utils/pdfExport.ts` | Bedingte Ausgabe von FineDine |
| `src/utils/excelExport.ts` | Bedingte Ausgabe von FineDine |
| `src/pages/DailySummary.tsx` | `hiddenFields` weiterreichen |


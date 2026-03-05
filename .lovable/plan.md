

## Plan: Feiertage = Sonntage (50%), eine Spalte "So/Fei"

### Was sich ändert
Im Simple-Modus werden Feiertage nicht mehr mit 125% berechnet, sondern identisch wie Sonntage mit **50%**. Die zwei separaten Spalten "So" und "Fei" werden zu einer einzigen Spalte **"So/Fei"** zusammengelegt. Die `sunday_holiday_hours` im DB bleiben unverändert — die Unterscheidung `is_holiday` wird im Simple-Modus einfach ignoriert.

### Betroffene Dateien und Änderungen

#### 1. Typen: `src/pages/zeiterfassung/buchhaltung/types.ts`
- `sonntagStunden` und `feiertagStunden` → durch ein einziges Feld `soFeiStunden` ersetzen (= `sunday_holiday_hours` ohne `is_holiday`-Unterscheidung)

#### 2. Aggregation: `src/pages/zeiterfassung/buchhaltung/utils.ts`
- `getEmployeeTotals`: `soFeiStunden = sum(sunday_holiday_hours)` — kein `is_holiday`-Check mehr

#### 3. UI-Tabellen (eine Spalte statt zwei):
- **`ZtZusammenfassung.tsx`**: Header "So" + "Fei" → "So/Fei", Totals verwenden `soFeiStunden`
- **`ZtBuchhaltung.tsx`** + `BuchhaltungFooter.tsx` + `BuchhaltungRow.tsx` + `BuchhaltungTableHead.tsx` + `BuchhaltungDeptHeader.tsx`: Spaltenanzahl -1, "So/Fei" statt zwei Spalten
- **`SfnTooltipHeader.tsx`**: "feiertag"-Tooltip entfernen oder in "soFei" umwandeln mit 50%-Label

#### 4. SFN-Berechnung in Brutto/Netto: `ZtBruttoNetto.tsx`
- Aggregation (Zeilen 130–156): `agg.sunday` und `agg.holiday` zusammenlegen → alles geht in `sunday` mit 50%
- Payload an Edge Function: `holiday: 0` (keine separaten Feiertagsstunden mehr im Simple-Modus)

#### 5. Edge Function: `calculate-payroll/index.ts`
- Keine Änderung nötig — `holiday` kommt einfach als 0 rein

#### 6. SFN-Konstanten: `src/lib/sfnRates.ts`
- `holiday: 1.25` bleibt vorhanden (für Extended-Modus später), wird im Simple-Modus aber nicht genutzt

#### 7. Exporte (PDF, Excel, CSV):
- **`exportZusammenfassungPdf.ts`**: Header und Daten — eine Spalte "So/Fei" statt zwei
- **`exportBuchhaltungPdf.ts`**: Gleiche Anpassung
- **`exportBuchhaltungExcel.ts`**: Gleiche Anpassung
- **`exportZusammenfassungExcel.ts`**: Gleiche Anpassung
- **`exportWochenplanPdf.ts`** / **`exportWochenplanExcel.ts`**: Falls dort So/Fei-Spalten vorhanden, ebenfalls anpassen
- **`exportCsv.ts`**: Eine Spalte statt zwei

#### 8. Shared Views:
- **`SharedZtView.tsx`** und **`PayrollPortal.tsx`**: Gleiche Spalten-Zusammenlegung

### Nicht betroffen
- DB-Schema (`zt_shifts.is_holiday`, `sunday_holiday_hours`) — bleibt unverändert
- Wochenplan-Ansicht (dort gibt es keine So/Fei-Spalten)
- Die Berechnung in `shiftCalculations.ts` (`calculateShiftHours`) — `isSundayOrHoliday` berechnet weiterhin korrekt die Stunden


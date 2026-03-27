

# Plan: Perioden-Selector für die Batch-Berechnung

## Problem
Die Batch-Berechnung verwendet `dateFrom`/`dateTo` aus der auf der Brutto-Netto-Seite gewählten Periode (typischerweise die aktuelle, noch laufende Periode). Der Nutzer möchte die Berechnungsperiode direkt in der Batch-Karte auswählen können.

## Lösung
Einen eigenen Perioden-Selector in `BatchPayrollCalculation.tsx` einbauen.

## Änderungen

### 1. `src/pages/zeiterfassung/ZtBruttoNetto.tsx`
- `periods` als neue Prop an `BatchPayrollCalculation` übergeben
- `dateFrom`/`dateTo` Props beibehalten als Fallback/Default

### 2. `src/components/zeiterfassung/BatchPayrollCalculation.tsx`
- Neue Prop `periods` (Array aller Perioden) hinzufügen
- Eigenen State `selectedBatchPeriodId` mit Select-Dropdown einfügen
- **Standard-Auswahl**: Die letzte abgeschlossene Periode (deren `end_date < heute`)
- Intern `dateFrom`/`dateTo` aus der gewählten Periode ableiten (überschreibt die Props)
- Select-Dropdown im CardHeader neben dem Button platzieren, Label-Format: Perioden-Label (z.B. "März 2026")

## Technische Details
- Perioden kommen aus dem ZtContext und sind restaurantspezifisch, aber da die Batch-Berechnung alle Restaurants abdeckt, werden die Perioden-Daten nur zur Bestimmung des Datumsbereichs genutzt (alle Restaurants haben identische Datumsbereiche)
- Die Schicht-Queries filtern bereits nach `shift_date` BETWEEN, daher funktioniert jeder beliebige Datumsbereich




# Plan: Batch-Brutto-Netto-Berechnung für ALLE Restaurants

## Übersicht
Ein "Alle Mitarbeiter berechnen"-Button auf der Brutto-Netto-Seite, der für **alle Mitarbeiter aller Restaurants** (nicht nur des aktuellen) die Lohnberechnung durchführt und die Ergebnisse in einer Tabelle gruppiert nach Restaurant anzeigt.

## Änderungen

### 1. Datei: `src/pages/zeiterfassung/ZtBruttoNetto.tsx`

**Neue States & Imports:**
- `batchResults` Array mit Ergebnissen pro Mitarbeiter (Name, Restaurant, Stunden, Brutto, Netto, SFN, Auszahlung, AG-Kosten)
- `batchCalculating` Boolean + Fortschritt (z.B. "5/23")
- Import `useRestaurants` für die Liste aller Restaurants
- Import `Progress` Komponente

**Neue Funktion `handleBatchCalculate`:**
1. Alle Restaurants laden (aus `useRestaurants`)
2. Für jedes Restaurant: `staff_restaurants` mit `zt_hourly_rate` + `staff`-Stammdaten (tax_class, health_insurance, is_sv_exempt) laden
3. Alle `zt_shifts` für die gewählte Periode laden (ein Query pro Restaurant-Periode-Kombination, da Perioden restaurant-spezifisch sind)
4. Problem: Perioden sind pro Restaurant unterschiedlich → Lösung: Für jedes Restaurant die Periode finden, deren Datumsbereich mit der aktuell gewählten übereinstimmt (gleicher `start_date`/`end_date`), oder alternativ direkt nach `shift_date` Bereich filtern
5. Pro Mitarbeiter: SFN-Stunden aggregieren (bestehende `aggregateSimple`/`aggregateExtended` wiederverwenden), dann sequentiell `calculate-payroll` aufrufen
6. Ergebnisse in State speichern

**Neue UI-Section (oberhalb des Einzelrechners):**
- Button "Alle Mitarbeiter berechnen" mit Fortschrittsanzeige
- Ergebnistabelle gruppiert nach Restaurant:
  | Mitarbeiter | Abt. | Stunden | Brutto | Netto | SFN | Auszahlung | AG-Kosten |
- Summenzeile pro Restaurant + Gesamtsumme
- Info-Banner: "Standardwerte für Kinderfreibeträge (0), Kirchensteuer (nein), Bundesland (Bayern)"
- Zeilen ohne Stundenlohn → Warnhinweis
- Klick auf Zeile → füllt den Einzelrechner mit diesem Mitarbeiter

### 2. Datenfluss

```text
handleBatchCalculate()
│
├─ restaurants[] (aus useRestaurants Hook)
│
├─ Für jedes Restaurant:
│   ├─ staff_restaurants + staff JOIN → Mitarbeiter mit Lohn/Steuer/SV
│   ├─ scheduling_periods → passende Periode finden (gleicher Zeitraum)
│   ├─ zt_shifts im Zeitraum → SFN-Stunden aggregieren
│   └─ Pro Mitarbeiter: calculate-payroll Edge Function aufrufen
│
└─ Ergebnis: Array<{ restaurantName, staffName, dept, hours, gross, net, sfn, payout, agCost }>
```

### Hinweise
- Die Perioden könnten pro Restaurant unterschiedliche IDs haben aber gleiche Datumsbereiche. Deshalb wird direkt nach `shift_date` BETWEEN `dateFrom` AND `dateTo` gefiltert statt nach `week_id`
- Sequentielle API-Aufrufe mit kleinem Delay (50ms) um Rate-Limits zu vermeiden
- Bestehender Einzelrechner bleibt unverändert


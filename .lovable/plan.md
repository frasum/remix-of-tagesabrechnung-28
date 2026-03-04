

## Plan: Brutto-Netto-Rechner 2026 als neuer Zeiterfassungs-Tab

### Übersicht

Neuer Tab "Brutto/Netto" im Zeiterfassungs-Layout, der die vorhandenen Schicht- und SFN-Daten nutzt und eine vereinfachte Brutto-Netto-Berechnung für Deutschland 2026 durchführt.

### 1. Navigation erweitern

**ZtLayout.tsx** — Neuen Tab einfügen:
```text
allTabs = [
  Wochenplan, Zusammenfassung, Buchhaltung, Perioden,
  + { label: "Brutto/Netto", path: "brutto-netto", permPath: "zeiterfassung/brutto-netto" }
]
```

**App.tsx** — Neue Route unter `zeiterfassung`:
```text
<Route path="brutto-netto" element={<ZtBruttoNetto />} />
```

### 2. Neue Seite: `ZtBruttoNetto.tsx`

Zwei Bereiche:

**A) Eingabeformular (Lohnparameter)**
- Mitarbeiter-Auswahl (Dropdown aus `useRestaurantEmployees`) — befüllt automatisch Steuerklasse, Stundenlohn aus `staff`-Tabelle
- Bruttogehalt ODER Stundenlohn + Monatsstunden
- Steuerklasse (I–VI), Bundesland, Kirchensteuer (ja/nein)
- KV-Art (gesetzlich/privat), Kinderfreibeträge (0–8 in 0,5-Schritten)
- Zeitraum-Auswahl (Monat oder Datums-Range) zum Abruf der Schichtdaten

**B) SFN-Datenblock aus Schichten**
- Query auf `zt_shifts` für gewählten Mitarbeiter + Zeitraum
- Aggregation: Gesamtstunden, Nachtstunden, Sonntagsstunden, Feiertagsstunden
- Info-Block: "Aus deinen erfassten Schichten: X Nachtstd., Y Sonntagsstd., Z Feiertagsstd."
- Hinweis wenn keine Schichten vorhanden

### 3. Edge Function `calculate-payroll`

Neuer Backend-Endpunkt, der die Steuerberechnung serverseitig durchführt.

**Input (JSON):**
```text
{
  grossMonthly, hourlyRate, monthlyHours,
  taxClass, state, churchTax, insuranceType,
  childAllowances,
  sfnHours: { night, sunday, holiday },
  sfnHourlyRate
}
```

**Berechnung (vereinfacht für 2026):**
- Lohnsteuer nach Steuerklasse (Tabellenwerte/Formeln)
- Solidaritätszuschlag (5,5% der LSt wenn über Freigrenze)
- Kirchensteuer (8% oder 9% der LSt je nach Bundesland)
- AN-Anteile: KV (7,3% + Zusatzbeitrag ~0,9%), RV (9,3%), AV (1,3%), PV (1,7% + ggf. Zuschlag)
- AG-Anteile: KV (7,3% + halber Zusatzbeitrag), RV (9,3%), AV (1,3%), PV (1,7%)
- SFN-Zuschläge: Nacht 25%, Sonntag 50%, Feiertag 125% × Stundenlohn × Stunden (steuerfrei bis Grenze)

**Output:**
```text
{
  grossMonthly, netMonthly,
  incomeTax, soli, churchTax,
  employee: { kv, rv, av, pv },
  employer: { kv, rv, av, pv },
  employerTotal,
  sfn: { nightBonus, sundayBonus, holidayBonus, totalBonus },
  effectiveNetHourlyRate
}
```

### 4. Ergebnisdarstellung

Nach "Berechnen"-Klick:
- **Zusammenfassungskarten**: Grundbrutto, Netto, AG-Kosten
- **Detailtabelle**: Alle Abzugsposten (LSt, Soli, KiSt, AN-KV/RV/AV/PV, AG-KV/RV/AV/PV)
- **SFN-Block** (wenn Schichtdaten vorhanden): Nachtzuschlag, Sonntagszuschlag, Feiertagszuschlag, Summe, effektiver Netto-Stundenlohn
- **Rechtlicher Hinweis**: "Diese Berechnung ist unverbindlich..."

### 5. SFN-Zuschlagsprozente

Bestehende Logik in `shiftCalculations.ts` berechnet nur die **Stunden** pro Kategorie, nicht die Zuschlagsprozente. Neue gemeinsame Konstanten:
```text
SFN_RATES = { night: 0.25, sunday: 0.50, holiday: 1.25 }
```
In `shiftCalculations.ts` exportieren, im Frontend und in der Edge Function nutzen.

### 6. Neue Dateien

```text
src/pages/zeiterfassung/ZtBruttoNetto.tsx     — Hauptseite
src/lib/sfnRates.ts                           — SFN-Zuschlagskonstanten
src/types/payroll.ts                          — TypeScript-Typen
supabase/functions/calculate-payroll/index.ts — Edge Function
```

### 7. Geänderte Dateien

```text
src/pages/zeiterfassung/ZtLayout.tsx  — Tab hinzufügen
src/App.tsx                           — Route hinzufügen
supabase/config.toml                  — JWT-Config für neue Function
```


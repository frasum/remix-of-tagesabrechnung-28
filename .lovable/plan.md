
# Plan: Kellner-Trinkgeld Pool-System

## Aktueller Zustand vs. gewünschtes Verhalten

| Aspekt | Aktuell | Gewünscht |
|--------|---------|-----------|
| Kellner TG | Jeder behält sein eigenes | Alle werfen in einen Topf, geteilt durch Anzahl |
| Küchen TG | Bereits gepoolt (nach Stunden) | Bleibt unverändert |

### Beispiel

**Aktuell (individuell):**
| Kellner | Eigenes TG |
|---------|------------|
| Frank | 150,00 € |
| Max | 80,00 € |
| Lisa | 120,00 € |

**Neu (gepoolt):**
| Kellner | Beitrag zum Pool | Anteil (1/3) |
|---------|------------------|--------------|
| Frank | 150,00 € | 116,67 € |
| Max | 80,00 € | 116,67 € |
| Lisa | 120,00 € | 116,67 € |
| **Pool Gesamt** | **350,00 €** | |

---

## Umsetzungsplan

### 1. Kellner-Abrechnung (WaiterCashUp.tsx)

**Neue Pool-Berechnung hinzufügen:**

```text
Für alle Kellner des Tages:
  pool_total = SUM(cash_handed_in - expected - kitchen_tip)
  kellner_count = COUNT(waiter_shifts)
  tip_per_waiter = pool_total / kellner_count
```

**Neue UI-Elemente:**

- StatCard oben: "Kellner TG Pool" mit Gesamtsumme
- StatCard: "Pro Kellner" mit geteiltem Betrag
- Tabelle: Spalte "Beitrag" (individuell) + "Anteil" (gleichmäßig)

### 2. Tagesabrechnung (DailySummary.tsx)

- Pool-Berechnung übernehmen
- Anzeige: "Kellner Trinkgeld Pool: X € (Y Kellner × Z €)"

### 3. Statistiken (useStatistics.ts)

- Berechnung anpassen: Jeder Kellner erhält den gleichen Anteil pro Schicht
- Nicht mehr individuelles TG, sondern Pool-Anteil tracken

### 4. PDF Export

- Pool-System in der Zusammenfassung darstellen

---

## UI-Mockup für Kellner-Abrechnung

```text
┌─────────────────────────────────────────────────────────────────┐
│  Kellner TG Pool    │  Pro Kellner (3)   │  Küchen TG Pool      │
│  350,00 €           │  116,67 €          │  125,00 €            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Kellner Übersicht                                               │
├─────────────────────────────────────────────────────────────────┤
│ Name   │ POS  │ Kassiert │ ... │ Beitrag │ Anteil │ K.TG       │
│ Frank  │ 500  │ 500      │ ... │ +150 €  │ 116,67€│ 10,00 €    │
│ Max    │ 300  │ 300      │ ... │ +80 €   │ 116,67€│ 6,00 €     │
│ Lisa   │ 400  │ 400      │ ... │ +120 €  │ 116,67€│ 8,00 €     │
├─────────────────────────────────────────────────────────────────┤
│ GESAMT │      │          │     │ 350 €   │ 350 €  │ 24,00 €    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technische Änderungen

| Datei | Änderung |
|-------|----------|
| `src/pages/WaiterCashUp.tsx` | Pool-Berechnung, neue StatCards, Tabellenspalten anpassen |
| `src/pages/DailySummary.tsx` | Pool-Anzeige in Zusammenfassung |
| `src/hooks/useStatistics.ts` | Statistik-Berechnung auf Pool-Anteil umstellen |
| `src/utils/pdfExport.ts` | Pool-Darstellung im Export |
| `src/components/statistics/WaiterTipChart.tsx` | Tooltip/Tabelle anpassen (zeigt Pool-Anteil) |

---

## Berechnungslogik im Detail

```text
// Für jeden Tag:
waiterShifts = alle Kellner-Schichten des Tages

// Beitrag jedes Kellners zum Pool
for each shift:
  expected = kassiert_brutto + hilf_mahl - open_invoices - card_total
  contribution = cash_handed_in - expected - kitchen_tip

// Pool-Gesamtsumme
poolTotal = SUM(contributions)

// Gleichmäßige Verteilung
waiterCount = waiterShifts.length
tipPerWaiter = poolTotal / waiterCount

// Statistik pro Person (über Zeitraum):
personStats[name].totalPoolShare += tipPerWaiter
personStats[name].shiftsCount += 1
```

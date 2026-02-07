
## Monatliche Trinkgeld-Übersicht: Umsetzungsplan

### Zusammenfassung

Du wirst zwei neue Funktionen erhalten:
1. **Auf der Küchen-Trinkgeld-Seite**: Eine neue Karte zeigt, wie viel jeder Küchenmitarbeiter im laufenden Monat bereits an Trinkgeld erhalten hat
2. **In den Statistiken**: Eine neue Monatsübersicht zeigt das Trinkgeld pro Mitarbeiter (sowohl Kellner als auch Küche) aufgeschlüsselt nach Monaten

---

### Teil 1: Monatliche Trinkgeld-Anzeige auf der Küchen-Seite

Eine neue "Monat bisher"-Karte wird unter den bestehenden Statistik-Karten eingefügt. Diese zeigt:
- Gesamtes Küchen-Trinkgeld im aktuellen Monat
- Trinkgeld pro Mitarbeiter im aktuellen Monat
- Gearbeitete Stunden im aktuellen Monat

Visuelle Darstellung:
```text
+-----------------------------------------------+
| Monats-Übersicht (Februar 2026)               |
+-----------------------------------------------+
| Name          | Stunden  | Trinkgeld          |
|---------------|----------|-------------------|
| Hans Koch     | 120.5 Std| 245,00 €          |
| Maria Küchler | 98.0 Std | 198,50 €          |
| Deau          | 85.0 Std | 172,30 €          |
+-----------------------------------------------+
| Gesamt        | 303.5 Std| 615,80 €          |
+-----------------------------------------------+
```

---

### Teil 2: Statistiken - Monatliche Trinkgeld-Auswertung

Eine neue Ansicht in den Statistiken ermöglicht die Auswertung nach Monaten:
- Horizontales Balkendiagramm für Kellner-Trinkgeld pro Monat
- Horizontales Balkendiagramm für Küchen-Trinkgeld pro Monat  
- Detailtabelle mit Aufschlüsselung pro Mitarbeiter und Monat

---

### Technische Umsetzung

#### 1. Neuer Hook: `useMonthlyStaffTips`
- Aggregiert Trinkgeld-Daten pro Mitarbeiter und Monat
- Lädt alle relevanten Sessions, waiter_shifts und kitchen_shifts
- Berechnet die Trinkgeld-Anteile basierend auf der Pool-Logik (Kellner) bzw. Stunden (Küche)
- Gruppiert Ergebnisse nach Monat (Format: "YYYY-MM")

```text
Datenstruktur:
{
  month: "2026-02",
  waiterTips: [
    { name: "Gerard", tip: 456.00 },
    { name: "Anna", tip: 412.50 }
  ],
  kitchenTips: [
    { name: "Hans Koch", hours: 120.5, tip: 245.00 },
    { name: "Maria Küchler", hours: 98.0, tip: 198.50 }
  ]
}
```

#### 2. Neue Komponente: `MonthlyKitchenTipCard`
- Platzierung: Auf der Küchen-Trinkgeld-Seite (`/kitchen`)
- Zeigt Daten für den aktuellen Monat
- Tabelle mit Name, Stunden und Trinkgeld
- Lädt Daten über den neuen Hook

#### 3. Neue Statistik-Komponente: `MonthlyTipBreakdown`
- Platzierung: Auf der Statistik-Seite unter den bestehenden Charts
- Tabs für "Kellner" und "Küche"
- Dropdown zur Monatsauswahl
- Balkendiagramm mit Ranking
- Detailtabelle mit allen Mitarbeitern

#### 4. Änderungen an bestehenden Dateien
- `src/pages/KitchenTipSplit.tsx`: Neue `MonthlyKitchenTipCard` einfügen
- `src/pages/Statistics.tsx`: Neue `MonthlyTipBreakdown` Komponente einfügen
- `src/hooks/useStatistics.ts`: Erweitern um monatliche Aggregation (optional)

---

### Dateien die erstellt werden

| Datei | Beschreibung |
|-------|-------------|
| `src/hooks/useMonthlyStaffTips.ts` | Hook für monatliche Trinkgeld-Aggregation |
| `src/components/kitchen/MonthlyKitchenTipCard.tsx` | Monatskarte für Küchen-Seite |
| `src/components/statistics/MonthlyTipBreakdown.tsx` | Monatsauswertung für Statistiken |

### Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/pages/KitchenTipSplit.tsx` | Import + Einfügen der MonthlyKitchenTipCard |
| `src/pages/Statistics.tsx` | Import + Einfügen der MonthlyTipBreakdown |

---

### Berechnungslogik

**Kellner-Trinkgeld pro Monat:**
- Für jede Session im Monat: Pool berechnen (Summe aller Beiträge minus Küchen-TG)
- Pool gleichmäßig auf alle Kellner der Session verteilen
- Aggregieren pro Kellner über alle Sessions im Monat

**Küchen-Trinkgeld pro Monat:**
- Für jede Session im Monat: Küchen-Pool und Gesamtstunden laden
- Trinkgeld proportional nach gearbeiteten Stunden verteilen
- Aggregieren pro Küchenmitarbeiter über alle Sessions im Monat

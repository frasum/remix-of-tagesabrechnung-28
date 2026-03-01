

## Restaurant-Vergleich und kumulierte Statistiken

### Konzept

Zwei neue Modi für die Statistik-Seite, steuerbar über einen Toggle/Selector im Header:

**1. Restaurant-Vergleich** -- Nebeneinander-Vergleich der Kennzahlen beider Restaurants
**2. Kumuliert (Alle Restaurants)** -- Zusammengefasste Daten über alle Standorte

### Umsetzung

**A. Neuer Hook `useStatisticsMultiRestaurant.ts`**
- Akzeptiert `mode: 'single' | 'compare' | 'cumulated'` und die Restaurant-IDs
- Im `compare`-Modus: Lädt `useStatistics` parallel für jedes Restaurant und gibt beide Datensätze zurück
- Im `cumulated`-Modus: Lädt Sessions/Shifts/Expenses ohne `restaurant_id`-Filter (bzw. für alle zugewiesenen Restaurants), aggregiert alles in eine gemeinsame Auswertung
- Trinkgeld-Verteilung kumuliert: Waiter-Pool und Küchen-TG werden pro Mitarbeitername über alle Restaurants summiert

**B. UI-Erweiterung in `Statistics.tsx`**
- Neuer Selector neben dem Zeitraum-Tabs: `[Spicery] [YUM] [Alle] [Vergleich]`
- `Alle`: Kumulierte Ansicht -- gleiche Charts, aber mit Daten aus allen Restaurants
- `Vergleich`: Zusätzliche Vergleichs-Card mit Kennzahlen nebeneinander (Restaurant A vs B), ähnlich dem bestehenden `PeriodComparison`-Layout

**C. Neue Komponente `RestaurantComparison.tsx`**
- Tabelle im Stil von `PeriodComparison`, aber Spalten = Restaurant-Namen statt Zeiträume
- Zeigt Gesamtumsatz, Ø Tagesumsatz, Trinkgeld, Lieferumsatz, Ausgaben pro Restaurant

**D. Anpassung bestehender Charts**
- `WaiterTipChart` und `KitchenTipChart`: Im kumulierten Modus werden die Daten aus dem neuen Hook genutzt -- gleiche Komponenten, nur andere Datenquelle
- Im Vergleichsmodus optional: Grouped bars (Restaurant A + B nebeneinander pro Mitarbeiter)

### Technische Details

```text
Statistics.tsx
├── [Restaurant-Selector: Spicery | YUM | Alle | Vergleich]
├── [Zeitraum-Tabs: Woche | Monat | 3M | Custom]
│
├── mode=single:  useStatistics(range, restaurantId)         -- wie bisher
├── mode=cumulated: useStatistics(range, null) + alle IDs    -- neuer Query ohne restaurant_id Filter
├── mode=compare:  useStatistics(range, idA) + useStatistics(range, idB)
│
├── Summary Cards (kumuliert oder per Restaurant)
├── Charts (gleiche Komponenten, andere Daten)
└── RestaurantComparison (nur im Vergleichsmodus)
```

Änderungen an `useStatistics`: Neuer Parameter `restaurantIds?: string[]` als Alternative zu `restaurantId`. Wenn ein Array übergeben wird, filtert der Query mit `.in('restaurant_id', restaurantIds)` statt `.eq()`.

### Dateien

| Datei | Änderung |
|---|---|
| `src/hooks/useStatistics.ts` | `restaurantIds[]` Support hinzufügen |
| `src/pages/Statistics.tsx` | Restaurant-Selector, Mode-State, bedingte Datenquellen |
| `src/components/statistics/RestaurantComparison.tsx` | Neue Komponente für den Vergleichsmodus |
| `src/hooks/useStatisticsComparison.ts` | Gleiche Multi-Restaurant-Unterstützung |


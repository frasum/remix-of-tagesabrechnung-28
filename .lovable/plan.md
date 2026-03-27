

## Restaurant-Filter-Buttons in der ZtToolbar

### Konzept
Der einzelne "Alle Restaurants"-Toggle wird durch eine segmentierte Button-Gruppe ersetzt:

```text
[Periode ▼]  [Gesperrt]  [ YUM | Spicery | Alle ]        [PDF] [Excel]
```

- Standardmäßig ist das aktuelle Restaurant (aus URL/Sidebar) vorausgewählt
- Klick auf ein anderes Restaurant oder "Alle" wechselt auf kumulierte Daten mit entsprechendem Filter
- Funktioniert unabhängig von der Sidebar-Navigation

### Änderungen

**1. `src/components/zeiterfassung/ZtToolbar.tsx`**
- Alte Props `showCumulated`, `cumulated`, `onCumulatedToggle` durch neue Props ersetzen: `restaurants?: {id: string, name: string}[]`, `restaurantFilter?: string | 'all'`, `onRestaurantFilterChange?: (id: string | 'all') => void`
- Segmentierte Button-Gruppe rendern: ein Button pro Restaurant + "Alle"

**2. `src/pages/zeiterfassung/ZtBuchhaltung.tsx`**
- `cumulated` boolean-State durch `restaurantFilter` State ersetzen (default = aktuelles `restaurantId`)
- `cumulated` als abgeleiteter Wert: `restaurantFilter !== restaurantId`
- `useRestaurants()` importieren, an Toolbar übergeben
- Employees bei spezifischem fremden Restaurant zusätzlich filtern

**3. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- Gleiche Umstellung

**4. `src/pages/zeiterfassung/ZtWochenplan.tsx`**
- Gleiche Umstellung

**5. `src/pages/shared/PayrollPortal.tsx`**
- Prüfen ob dort der Toggle verwendet wird und ggf. anpassen

### Filterlogik
```text
restaurantFilter = restaurantId  → lokale Daten (wie bisher, kein kumuliert)
restaurantFilter = andere ID     → kumulierte Daten laden, nach diesem Restaurant filtern
restaurantFilter = "all"         → kumulierte Daten laden, alle zeigen
```

5 Dateien, keine DB-Änderungen.


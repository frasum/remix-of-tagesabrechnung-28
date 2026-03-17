

## Plan: Bayerische Feiertage im Dienstplan-Header hervorheben

### Was sich ändert
Feiertage werden im Spalten-Header des Dienstplans farblich hervorgehoben (wie Sonntage, in rot) und erhalten einen Tooltip mit dem Feiertagsnamen.

### Änderungen

**`src/components/dienstplan/MonthlyGrid.tsx`**

1. **Feiertage laden**: Query auf `bavarian_holidays` mit `holiday_date` und `name` für den Datumsbereich (`startDate`–`endDate`), gespeichert als `Map<string, string>` (Datum → Name). Gleiches Pattern wie in `ZtWochenplan.tsx` bereits verwendet.

2. **Header-Spalten anpassen** (Zeilen 188–208):
   - Für jedes Datum prüfen ob es in der `holidayMap` ist
   - Falls ja: gleiche rote Hervorhebung wie Sonntage (`bg-red-50 text-red-700`)
   - Den gesamten `<th>` in ein `<Tooltip>` wrappen, das den Feiertagsnamen anzeigt
   - Sonntage erhalten ebenfalls einen Tooltip mit "Sonntag"

### Technische Details

```typescript
// Neue Query
const { data: holidayMap = new Map() } = useQuery({
  queryKey: ["bavarian-holidays-dienstplan", startDate, endDate],
  queryFn: async () => {
    const { data } = await supabase
      .from("bavarian_holidays")
      .select("holiday_date, name")
      .gte("holiday_date", startDate)
      .lte("holiday_date", endDate);
    return new Map(data?.map(h => [h.holiday_date, h.name]) ?? []);
  },
});

// Im Header: isHoliday check + Tooltip
const holidayName = holidayMap.get(date);
const isHoliday = !!holidayName;
// Styling: isHoliday || isSunday → bg-red-50 text-red-700
// Tooltip: holidayName oder "Sonntag"
```


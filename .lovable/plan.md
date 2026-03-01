

## Sonntage nur bei Feiertag hervorheben

### Änderungen

| Datei | Änderung |
|---|---|
| `src/pages/zeiterfassung/ZtWochenplan.tsx` | Neben `sundayHolidayDays` ein separates `holidayDays`-Set erstellen, das nur Feiertage (aus `bavarian_holidays`) enthält. Die visuelle Hervorhebung (rosa Hintergrund `sunday-col`, rote Schrift `text-destructive`) nur anwenden wenn `holidayDays.has(dateStr)`, nicht für normale Sonntage. Das `sundayHolidayDays`-Set bleibt für die Stundenberechnung (Sonntagszuschläge) unverändert. |

### Detail
- Neues Set: `const holidayDays = new Set(weekDays.filter(day => holidays?.has(format(day, "yyyy-MM-dd"))).map(...))`
- Header: `isSunHol ? "sunday-col"` → `isHoliday ? "sunday-col"` und `text-destructive` nur bei `isHoliday`
- Body-Zellen: `sunClass` nur bei Feiertag, nicht bei normalem Sonntag
- Stundenberechnung (`calculateShiftHours`) bleibt unverändert — Sonntage zählen weiterhin als Zuschlagstage


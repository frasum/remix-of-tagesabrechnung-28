

## Plan: Wochenplan als erste Zeiterfassungs-Seite integrieren

Basierend auf dem [Zeiterfassungs-Projekt](/projects/16b13f46-951f-456e-b79c-1968286eb715) werden folgende Dateien erstellt/angepasst. Die Tabellennamen werden umgemappt (`shifts` → `zt_shifts`, `employee_restaurants` → `staff_restaurants`, `employees` → `staff`).

### Neue Dateien

1. **`src/lib/shiftCalculations.ts`** — 1:1-Port aus dem Quellprojekt (calculateShiftHours, isSunday, formatHours, DEPARTMENT_ORDER, countVacationDays, countSickDays, getDepartmentBgClass)

2. **`src/lib/periodUtils.ts`** — 1:1-Port (ensurePeriodsExist, getPeriodRange, generateWeeks)

3. **`src/hooks/useRestaurantEmployees.ts`** — Angepasst auf `staff_restaurants` + `staff`-Tabelle:
   - Query: `staff_restaurants.select('zt_department, staff_id, staff!inner(id, perso_nr, first_name, last_name, nickname)')` gefiltert nach `restaurant_id`
   - Typ `RestaurantEmployee` mit `id, perso_nr, first_name, last_name, nickname, department`

4. **`src/contexts/ZtContext.tsx`** — Zeiterfassungs-Context für Perioden/Wochen-State:
   - Hält `selectedPeriodId`, `selectedWeekId`, Perioden-/Wochen-Queries
   - Auto-Auswahl der aktuellen Periode und Woche
   - Provider wird in den Zeiterfassungs-Routen-Wrapper eingebunden

5. **`src/pages/zeiterfassung/ZtWochenplan.tsx`** — Port des Wochenplans (~760 Zeilen), angepasst:
   - Nutzt `useRestaurant()` aus dem bestehenden Context statt eigenem Restaurant-State
   - Nutzt `ZtContext` für Perioden/Wochen
   - Tabelle `zt_shifts` statt `shifts`
   - Unique-Constraint-Feld `department` → mapped aus `staff_restaurants.zt_department`
   - `onConflict: "employee_id,shift_date,department"` beibehalten
   - Kein SidebarTrigger nötig (AppLayout liefert bereits Sidebar)

6. **`src/pages/zeiterfassung/ZtLayout.tsx`** — Wrapper mit Sub-Navigation (Tabs):
   - Tabs: Wochenplan (aktiv) — weitere folgen später (Zusammenfassung, Buchhaltung, Perioden)
   - Rendert `<Outlet />` für verschachtelte Routes

### Angepasste Dateien

7. **`src/index.css`** — Department-CSS-Variablen und Wochenplan-Tabellen-Styles hinzufügen:
   - CSS-Variablen: `--dept-kueche`, `--dept-gl`, `--dept-service`
   - Utility-Klassen: `dept-kueche`, `dept-gl`, `dept-service`, `dept-*-light`
   - Wochenplan-Tabelle: `.wochenplan-table` (Zebra, Sunday-Col, Sticky-Name, Day-Separator, Totals, Time-Input-Clean)

8. **`src/App.tsx`** — Neue Route `zeiterfassung/*` im `RestaurantRoutes`-Block:
   - `<Route path="zeiterfassung" element={<ZtLayout />}>`
   - `<Route index element={<ZtWochenplan />} />`

9. **`src/components/layout/AppLayout.tsx`** — Neuer NavItem:
   - `{ path: 'zeiterfassung', label: 'Zeiterfassung', icon: Clock, minLevel: 'manager' }`

### Keine Datenbankänderungen
Alle benötigten Tabellen (`zt_shifts`, `scheduling_periods`, `weeks`, `bavarian_holidays`, `staff_restaurants` mit `zt_department`/`zt_hourly_rate`) existieren bereits mit passenden RLS-Policies.

### Technische Details
- Die `zt_shifts`-Tabelle hat einen Unique-Index auf `(employee_id, shift_date, department)` für Upserts
- Perioden folgen dem 26.–25. Schema (z.B. "März 2026" = 26.02.–25.03.)
- Stunden werden in 4 Kategorien berechnet: Gesamt, Sonn-/Feiertag, Abend (20–24h), Nacht (0–x)
- Feiertage kommen aus der `bavarian_holidays`-Tabelle


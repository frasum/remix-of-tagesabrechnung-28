

## Plan: Zeiterfassung in Tagesabrechnung integrieren (Mitarbeiter zusammengeführt)

### Kernentscheidung: Mitarbeiter-Zusammenführung

Die bestehende `staff`-Tabelle wird erweitert statt eine separate `employees`-Tabelle zu erstellen. Das bedeutet:
- `staff` bekommt neue Spalten: `perso_nr`, `first_name`, `last_name`, `nickname`
- `staff_restaurants` bekommt neue Spalten: `zt_department` (Küche/GL/Service) und `zt_hourly_rate`
- Kein `staff_mapping` nötig -- Staff-IDs werden direkt in Zeiterfassungs-Tabellen referenziert
- Das bestehende `staff.name` bleibt fuer Tagesabrechnung, `first_name`/`last_name` fuer Zeiterfassung

### Phase 1: Datenbank-Schema

**1a. Enums erstellen**
- `zt_department`: `'Küche'`, `'GL'`, `'Service'`
- `period_status`: `'open'`, `'locked'`

**1b. `staff`-Tabelle erweitern**
- `perso_nr INTEGER UNIQUE` (nullable fuer bestehende Mitarbeiter)
- `first_name TEXT`
- `last_name TEXT`
- `nickname TEXT`

**1c. `staff_restaurants` erweitern**
- `zt_department zt_department` (nullable)
- `zt_hourly_rate NUMERIC(6,2) DEFAULT 0`

**1d. Neue Tabellen erstellen**

| Tabelle | Zweck |
|---|---|
| `scheduling_periods` | Abrechnungsperioden (25. bis 24.) pro Restaurant |
| `weeks` | 6 Wochen pro Periode |
| `zt_shifts` | Schicht-Einträge pro Mitarbeiter/Tag |
| `bavarian_holidays` | Bayerische Feiertage |
| `payroll_notes` | Vorschuss, Urlaub, Besonderheiten pro Periode |
| `daily_revenue` | Tagesumsatz pro Restaurant (Dashboard) |

Alle mit RLS-Policies (gleiche Muster wie bestehende Tabellen), Foreign Keys zu `staff.id` und `restaurants.id`.

### Phase 2: Utility-Layer portieren

- `src/lib/shiftCalculations.ts` -- 1:1 kopieren (reine Berechnungslogik)
- `src/lib/periodUtils.ts` -- angepasst auf bestehenden Supabase-Client
- `src/lib/exportWochenplanExcel.ts` -- portieren (braucht ggf. `xlsx-js-style` Paket)
- `src/lib/exportWochenplanPdf.ts` -- portieren
- `src/lib/exportBuchhaltungPdf.ts` -- portieren

### Phase 3: Hooks portieren

- `src/hooks/useZtEmployees.ts` -- ersetzt `useRestaurantEmployees`, liest aus `staff` + `staff_restaurants` mit `zt_department`
- `src/hooks/useCrossRestaurantData.ts` -- portieren, angepasst auf `staff`-Tabelle

### Phase 4: Seiten portieren

Alle unter `src/pages/zeiterfassung/`:

| Seite | Route | Beschreibung |
|---|---|---|
| `ZtDashboard.tsx` | `/zeiterfassung` | Übersicht mit Charts |
| `Wochenplan.tsx` | `/zeiterfassung/wochenplan` | Hauptseite: Schichtplanung |
| `Zusammenfassung.tsx` | `/zeiterfassung/zusammenfassung` | Periodenübersicht |
| `ZtBuchhaltung.tsx` | `/zeiterfassung/buchhaltung` | Lohn-Buchhaltung |
| `Perioden.tsx` | `/zeiterfassung/perioden` | Periodenverwaltung |

Plus Buchhaltung-Subkomponenten (`buchhaltung/`).

Die Mitarbeiter-Verwaltung wird in die bestehende `StaffManagement`-Seite integriert (neue Felder `perso_nr`, `first_name`, `last_name`, `nickname`, Restaurant-Department-Zuordnung).

### Phase 5: Integration und Navigation

- Routen in `App.tsx` registrieren (geschützt mit `ProtectedRoute requiredLevel="manager"`)
- Navigation in `AppLayout` ergänzen (neuer Bereich "Zeiterfassung")
- `RestaurantContext` erweitern um `selectedPeriodId` und `setSelectedPeriodId`
- Department-CSS-Variablen in `index.css` ergänzen

### Technische Details

**Zeiterfassungs-RestaurantContext-Divergenz:**
Das Quellprojekt hat einen eigenen `RestaurantContext` mit Period-Selection. Das bestehende `RestaurantContext` arbeitet slug-basiert über URL-Parameter. Lösung: Einen separaten `ZtContext` erstellen der die Period-Logik enthält und den bestehenden Restaurant-Context wiederverwendet.

**Staff-Tabellen-Mapping:**

```text
Zeiterfassung (employees)     →  Tagesabrechnung (staff)
─────────────────────────────────────────────────────────
perso_nr                      →  staff.perso_nr (NEU)
first_name                    →  staff.first_name (NEU)
last_name                     →  staff.last_name (NEU)
nickname                      →  staff.nickname (NEU)
department (per restaurant)   →  staff_restaurants.zt_department (NEU)
hourly_rate (per restaurant)  →  staff_restaurants.zt_hourly_rate (NEU)
```

**Abhängigkeit:** `xlsx-js-style` muss als neues npm-Paket installiert werden (wird fuer farbige Excel-Exports verwendet).

### Empfohlene Reihenfolge

Da das Gesamtvolumen ~30+ Dateien umfasst, sollte die Implementierung in 5 separaten Schritten erfolgen, die nacheinander abgearbeitet werden.




## Dienstplan – 2 Pläne pro Standort (Küche + Service/GL)

### Konzept

Pro Restaurant-Standort gibt es **zwei separate Dienstpläne**:

1. **Küche** – Alle Mitarbeiter mit `zt_department = 'Küche'` an diesem Standort
2. **Service** – Alle Mitarbeiter mit `zt_department = 'Service'` + Geschäftsleitung (GL)

Die Abteilungszuordnung existiert bereits über `staff_restaurants.zt_department`. Keine neue Spalte nötig.

### Routing & Navigation

```
/:restaurant/dienstplan/kueche    → Küchen-Dienstplan
/:restaurant/dienstplan/service   → Service-Dienstplan (inkl. GL)
/:restaurant/dienstplan           → Redirect auf /kueche
```

**Sidebar**: Ein Menüpunkt "Dienstplan" mit Unternavigation (Tabs) für Küche / Service – ähnlich wie Zeiterfassung mit Wochenplan/Zusammenfassung/Buchhaltung.

### Datenbank (5 neue Tabellen + 1 Spalte)

| Tabelle | Zweck |
|---------|-------|
| `skills` | VS, PASS, SPÜLEN, CO, SERVICE, BAR, GL – mit `category` und `color` |
| `employee_skills` | n:m Verknüpfung staff ↔ skills |
| `shift_assignments` | Eine Schicht pro MA pro Tag, mit `assigned_skill_id` und `department` ('kitchen'/'service') |
| `absences` | Urlaub / Krank mit Datumsbereich |

**`staff`-Erweiterung**: `contracted_hours_per_month` (numeric, nullable)

**`shift_assignments`** Struktur:
```sql
CREATE TABLE public.shift_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id),
  department text NOT NULL, -- 'kitchen' oder 'service'
  shift_date date NOT NULL,
  start_time time,
  end_time time,
  assigned_skill_id uuid REFERENCES public.skills(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (staff_id, shift_date)
);
```

Das `department`-Feld in `shift_assignments` stellt sicher, dass die Schichten dem richtigen Plan (Küche/Service) zugeordnet werden.

### Frontend-Dateien

| Datei | Zweck |
|-------|-------|
| `src/pages/DienstplanLayout.tsx` | Layout mit Tabs (Küche / Service), Outlet |
| `src/pages/dienstplan/DienstplanKueche.tsx` | Küchen-Grid (filtert `department='kitchen'`) |
| `src/pages/dienstplan/DienstplanService.tsx` | Service-Grid (filtert `department='service'`) |
| `src/components/dienstplan/MonthlyGrid.tsx` | Kern-Grid – wiederverwendbar für beide Pläne |
| `src/components/dienstplan/ShiftCell.tsx` | Zelle mit Skill-Farbe + Inline-Edit |
| `src/components/dienstplan/ShiftEditPopover.tsx` | Popover: Skill wählen, Zeit eingeben, Abwesenheit |
| `src/components/dienstplan/DienstplanToolbar.tsx` | Periodenwahl, Skill-Filter, MA-Filter |
| `src/components/dienstplan/DienstplanLegend.tsx` | Farblegende |
| `src/components/dienstplan/EmployeeSummaryColumn.tsx` | Std-Summe, Vertragsstd, Wochenenden |
| `src/components/dienstplan/SkillCoverageRow.tsx` | Tages-Skill-Besetzung (besonders wichtig für Küche) |
| `src/components/dienstplan/AbsenceDialog.tsx` | Mehrtägige Abwesenheit |
| `src/components/dienstplan/SkillBadge.tsx` | Farbiges Skill-Badge |
| `src/hooks/useDienstplan.ts` | CRUD Schichten + Abwesenheiten |
| `src/hooks/useSkills.ts` | CRUD Skills + Employee-Skills |

### Unterschiede Küche vs. Service

| Aspekt | Küche | Service |
|--------|-------|---------|
| MA-Filter | `zt_department = 'Küche'` | `zt_department IN ('Service', 'GL')` |
| Skills prominent | Ja – VS, PASS, SPÜLEN, CO als Farbbadges | Weniger relevant (SERVICE, BAR) |
| Skill-Besetzungszeile | Zeigt pro Tag: VS ✓, PASS ✓, SPÜLEN ✗ | Optional |
| Grid-Zellen | Skill-farbcodiert | Einfacher (Zeit + optional Skill) |

### Grid-Ansicht Küche (Beispiel)

```text
┌──────────────────┬──────┬──────┬──────┬──────┬───────┐
│ Mitarbeiter      │ 26.3 │ 27.3 │ 28.3 │ 29.3 │ Σ Std │
├──────────────────┼──────┼──────┼──────┼──────┼───────┤
│ Net  [VS][PASS]  │🔴 VS │🟠PASS│  U   │🔴 VS │  28h  │
│ Som  [VS][CO]    │🟢 CO │🔴 VS │🔴 VS │      │  21h  │
├──────────────────┼──────┼──────┼──────┼──────┼───────┤
│ Besetzung        │VS:2  │VS:1  │VS:1  │VS:1  │       │
│                  │CO:1  │PASS:1│      │      │       │
└──────────────────┴──────┴──────┴──────┴──────┴───────┘
```

### Implementierungsreihenfolge

1. DB-Migration (skills, employee_skills, shift_assignments, absences, staff-Erweiterung + Seed-Skills)
2. Hooks (useSkills, useDienstplan)
3. DienstplanLayout mit Tabs + Routing in App.tsx
4. MonthlyGrid + ShiftCell + ShiftEditPopover (wiederverwendbar)
5. DienstplanKueche + DienstplanService (jeweils mit Department-Filter)
6. SkillCoverageRow + Legende
7. Sidebar-Navigation ("Dienstplan" Eintrag)


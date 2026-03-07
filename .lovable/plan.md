

# Tagesaufschlüsselung & GL-Ausschluss für Provision

## Zusammenfassung
Zwei Änderungen in `ZtProvision.tsx`:
1. **GL-Mitarbeiter ausschließen** — Mitarbeiter mit GL-Rolle (`gl`, `waiter_gl`, `kitchen_gl`, `all`) werden aus der Provisionsberechnung herausgefiltert.
2. **Tagesaufschlüsselung** — Neue aufklappbare Tabelle unter den Summary-Karten mit pro Tag: Datum, Anzahl Service-MA (ohne GL), Service-Stunden, Gesamtumsatz.

## Technische Umsetzung

### 1. GL-Ausschluss
- Die Query erweitern: zusätzlich zu `waiter_shifts` auch `staff_id` gegen die `staff`-Tabelle prüfen.
- Separate Query auf `staff` mit Rollen laden (oder in der bestehenden Query über `staff_id` filtern).
- Da Supabase keine direkte FK-Beziehung von `waiter_shifts.staff_id` → `staff.id` hat, wird eine separate Query auf `staff` gemacht, um die Rollen zu laden.
- Beim Aggregieren werden Einträge gefiltert, deren `staff_id` eine GL-Rolle hat (Rollen `gl`, `waiter_gl`, `kitchen_gl`, `all` → alle die `enumToRoles(role).gl === true`).
- Hinweis-Text unter den Karten: "ohne GL-Mitarbeiter".

### 2. Tagesaufschlüsselung
- Neues `useMemo` das `waiterData` (nach GL-Filter) pro `session_date` gruppiert:
  - Datum (formatiert dd.MM.)
  - Anzahl Service-MA (distinct `staff_id || waiter_name`)
  - Σ Stunden
  - Σ Umsatz
- Darstellung als kleine Tabelle mit `Collapsible` (zugeklappt per default) mit dem Label "Tagesdetails".
- Footer-Zeile mit Gesamtsummen.

### Dateien
- `src/pages/zeiterfassung/ZtProvision.tsx` — einzige Datei die geändert wird




## Plan: Sonderfall "Peter" — Mo–Fr Schichten automatisch erzeugen

### Problem
Die aktuelle Schichtanpassung überschreibt nur **bestehende** Schichten. Für Peter sollen aber auch **fehlende** Schichten (Mo–Fr, 17:00–01:00) automatisch **erstellt** werden, selbst wenn noch keine Zeiteinträge vorhanden sind.

### Änderungen

**1. `src/components/zeiterfassung/ShiftTimeOverride.tsx`**
- Neue Prop `allEmployees` (alle Mitarbeiter des Restaurants, nicht nur die mit Schichten)
- Neue Prop `weeks` (mit `id`, `start_date`, `end_date` pro Woche — nötig um fehlende Tage zu ermitteln)
- Zweiter Bereich im UI: **"Schichten erzeugen & anpassen"** — hier werden Mitarbeiter angezeigt, für die Mo–Fr Schichten erzeugt werden sollen (auch wenn keine Einträge vorhanden sind)
- Logik bei Klick:
  1. Für jeden ausgewählten Mitarbeiter: alle Montag–Freitag-Tage der Periode ermitteln (aus den Wochen-Datumsbereichen)
  2. Bestehende Schichten für diese Tage laden
  3. Fehlende Tage per `INSERT` (upsert) in `zt_shifts` anlegen mit 17:00–01:00
  4. Bestehende Tage per `UPDATE` auf 17:00–01:00 setzen (Sa/So/Feiertage werden übersprungen — nur Mo–Fr)
  5. Stunden über `calculateShiftHours()` berechnen

**2. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- `allEmployees` (aus `useRestaurantEmployees`) und `weeks` (mit Datumsinformationen) an `ShiftTimeOverride` durchreichen

### UI-Entwurf
```text
┌─────────────────────────────────────────────┐
│ ⚙ Schichtzeiten anpassen (Admin)            │
│                                             │
│ Unter der Woche: 17:00 – 01:00             │
│ Sonn-/Feiertage: 15:00 – 02:00             │
│                                             │
│ ── Bestehende Schichten überschreiben ──    │
│ ☑ Max Mustermann (Küche)                    │
│ ☐ Anna Schmidt (Service)                    │
│ [Alle auswählen]  [Zeiten anpassen]         │
│                                             │
│ ── Mo–Fr Schichten erzeugen & anpassen ──   │
│ ☐ Peter (GL)                                │
│ Erzeugt fehlende Mo–Fr Einträge mit         │
│ 17:00–01:00 für die gesamte Periode.        │
│ [Schichten erzeugen]                        │
└─────────────────────────────────────────────┘
```

### Technische Details
- Tage generieren: Für jede Woche von `start_date` bis `end_date`, nur Mo(1)–Fr(5)
- Feiertage werden ausgeschlossen (kein Eintrag an Feiertagen)
- Upsert per `zt_shifts` mit unique constraint auf `(week_id, employee_id, shift_date, department)`
- Department wird aus `staff_restaurants.zt_department` genommen

### Kein Backend nötig
Alles läuft über den bestehenden Supabase-Client.




## Plan: Schichtzeiten-Überschreibung für ausgewählte Mitarbeiter

### Konzept
Ein neuer Admin-only Bereich in der Zusammenfassung, der es ermöglicht, für ausgewählte Mitarbeiter alle eingetragenen Schichten mit festen Zeiten zu überschreiben:
- **Unter der Woche**: 17:00 – 01:00
- **Sonn-/Feiertage**: 15:00 – 02:00

### Änderungen

**1. `src/pages/zeiterfassung/ZtZusammenfassung.tsx`**
- Neuer Abschnitt unterhalb der Tabelle (nur sichtbar für Admins via `useAuth().hasPermission('admin')`)
- Checkbox-Liste der Mitarbeiter mit Schichten in der aktuellen Periode
- Button "Zeiten anpassen" — führt ein Batch-Update aller Schichten der ausgewählten Mitarbeiter durch:
  - Für jede Schicht mit `start_time`/`end_time`: prüfen ob `shift_date` ein Sonntag oder in `bavarian_holidays` ist
  - Entsprechend `start_time`/`end_time` auf die festen Werte setzen
  - Stunden (`total_hours`, `evening_hours`, `night_hours`, `sunday_holiday_hours`) über `calculateShiftHours()` neu berechnen
  - Per `supabase.from('zt_shifts').update(...)` speichern

**2. Feiertags-Prüfung**
- Lade `bavarian_holidays` für den Perioden-Zeitraum (einfacher Select-Query)
- Kombiniere mit Sonntags-Check (`new Date(shift_date).getDay() === 0`)

### Kein Backend nötig
Alle Operationen laufen direkt über den Supabase-Client (die RLS-Policy auf `zt_shifts` erlaubt bereits ALL). Kein Edge Function nötig.

### UI-Entwurf
```text
┌─────────────────────────────────────────────┐
│ ⚙ Schichtzeiten anpassen (Admin)            │
│                                             │
│ Unter der Woche: 17:00 – 01:00             │
│ Sonn-/Feiertage: 15:00 – 02:00             │
│                                             │
│ ☑ Max Mustermann (Küche)                    │
│ ☐ Anna Schmidt (Service)                    │
│ ☑ Peter Müller (GL)                         │
│                                             │
│ [Alle auswählen]  [Zeiten anpassen]         │
└─────────────────────────────────────────────┘
```

Nach Bestätigung werden die Schichten aktualisiert und die Zusammenfassungs-Daten neu geladen.




## Problem

Aktuell unterstützt das System nur **einen** zweiten Mitarbeiter pro Schicht (`second_waiter_name`). Wenn alle 4 Mitarbeiter auf einem Schlüssel arbeiten, muss man die anderen 3 als separate Schichten anlegen, was die Pool-Berechnung verfälscht.

## Lösung: Team-Schicht mit mehreren Mitarbeitern

Die Spalte `second_waiter_name` (Text, einzelner Name) wird ersetzt durch `additional_waiters` (Text-Array, beliebig viele Namen). Dadurch können auf einer Schicht N Mitarbeiter zugewiesen werden. Der Pool-Anteil wird durch die Anzahl der Teammitglieder geteilt, und die TG%-Statistik wird jedem Mitglied korrekt zugerechnet.

### Beispiel

Statt:
- Schicht A: Mitarbeiter 1 + Mitarbeiter 2 (second_waiter)
- Schicht B (Dummy): Mitarbeiter 3 — verfälscht Pool
- Schicht C (Dummy): Mitarbeiter 4 — verfälscht Pool

Neu:
- Schicht A: Mitarbeiter 1 + [Mitarbeiter 2, Mitarbeiter 3, Mitarbeiter 4] — Pool wird durch 4 geteilt

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| **DB-Migration** | Neue Spalte `additional_waiters text[] DEFAULT '{}'` auf `waiter_shifts`. Bestehende `second_waiter_name`-Werte migrieren. Alte Spalte behalten für Abwärtskompatibilität. |
| `src/pages/WaiterCashUp.tsx` | Formular: Statt einem einzelnen `SecondWaiterSelect` ein Mehrfach-Auswahl-Feld für Team-Mitglieder. Share-Count = 1 + additional_waiters.length. |
| `src/components/shared/SecondWaiterSelect.tsx` | Erweitern zu `TeamWaiterSelect` mit Multi-Select-Unterstützung (oder neue Komponente). |
| `src/hooks/useSession.ts` | `useCreateWaiterShift` / `useUpdateWaiterShift`: `additional_waiters` Array statt einzelnem `second_waiter_name` speichern. `useWaiterTipAverages`: TG% für alle Team-Mitglieder berechnen. |
| `src/hooks/useStatistics.ts` | Pool-Verteilung: Share-Count = 1 + additional_waiters.length. TG%-Statistik für alle Teammitglieder zurechnen. |
| `src/pages/DailySummary.tsx` | Share-Count und Anzeige auf Array umstellen. Jedes Teammitglied als eigene Zeile rendern. |
| `src/types/database.ts` | Interface `WaiterShift`: `additional_waiters: string[]` hinzufügen. |
| `supabase/functions/send-telegram-summary` | Team-Schichten korrekt anzeigen. |

### Migrationsstrategie

1. Neue Spalte `additional_waiters text[] DEFAULT '{}'` hinzufügen
2. Bestehende Daten migrieren: `UPDATE waiter_shifts SET additional_waiters = ARRAY[second_waiter_name] WHERE second_waiter_name IS NOT NULL`
3. Code umstellen auf `additional_waiters`
4. `second_waiter_name` als berechnete/abgeleitete Spalte behalten oder entfernen


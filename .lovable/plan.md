

## Plan: Bayerische Feiertage im Restaurant-Chat verfügbar machen

### Problem
Die Edge Function `restaurant-chat` lädt keine Daten aus der `bavarian_holidays`-Tabelle. Der KI-Assistent hat daher keinen Zugriff auf Feiertagsinformationen und kann die Frage "liste die kommenden feiertage" nicht beantworten.

### Änderung: `supabase/functions/restaurant-chat/index.ts`

1. **Feiertage laden**: Parallel zu den bestehenden Queries eine Query auf `bavarian_holidays` hinzufügen, die alle Feiertage ab heute lädt (`.gte("holiday_date", today)`), sortiert nach Datum.

2. **Kontext-Abschnitt hinzufügen**: Neuen Abschnitt `=== BAYERISCHE FEIERTAGE ===` in `contextParts` einfügen mit Spalten: `Datum | Name | Zuschlagssatz | Ab Stunde`.

3. **System-Prompt ergänzen**: Regel hinzufügen, dass die Feiertags-Tabelle für Fragen nach kommenden Feiertagen, Zuschlägen an Feiertagen etc. verwendet werden soll.


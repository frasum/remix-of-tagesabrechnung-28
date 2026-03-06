

## Plan: Notizen in Telegram-Nachricht einbinden

### Ausgangslage
- Die `sessions`-Tabelle hat bereits ein `notes`-Feld (text, nullable)
- Die Edge Function `send-telegram-summary` liest bereits `session.*`, hat also Zugriff auf `session.notes`
- Es fehlt lediglich die Ausgabe im Nachrichtentext und ein Toggle in den Einstellungen

### Änderungen

**1. Telegram-Einstellungen: Neuen Toggle hinzufügen**

- **DB-Migration**: Neue Spalte `show_notes boolean default true` zur Tabelle `telegram_settings` hinzufügen
- **`src/hooks/useTelegramSettings.ts`**: `show_notes` in Interface und Query ergänzen
- **`src/pages/TelegramSettings.tsx`**: Neuen Toggle `Notizen` in die `metricToggles`-Liste einfügen

**2. Edge Function: Notizen ausgeben**

- **`supabase/functions/send-telegram-summary/index.ts`**:
  - `show_notes` aus den Settings laden (mit Default `true`)
  - Nach den bestehenden Abschnitten (Küche etc.) prüfen: wenn `settings.show_notes` und `session.notes` nicht leer ist, eine Zeile `📝 Notizen: {text}` ausgeben

### Ergebnis
Wenn in der Tagesabrechnung Notizen eingetragen wurden, erscheinen diese automatisch in der Telegram-Nachricht. Über den neuen Toggle kann die Anzeige deaktiviert werden.


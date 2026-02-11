

## Telegram-Einstellungen mit Metrik-Filtern

### Uebersicht
Erweiterung des bisherigen Plans um individuelle An/Aus-Schalter fuer jede Metrik, die in der Telegram-Nachricht gesendet wird. Der Admin kann granular steuern, welche Informationen im taeglichen Bericht erscheinen.

### Steuerbare Metriken

Folgende Metriken koennen einzeln aktiviert/deaktiviert werden:

| Metrik | Schluessel | Standard |
|---|---|---|
| Vectron (Tagesumsatz) | `show_pos_total` | An |
| Gaeste + Durchschnittsverbrauch | `show_guest_count` | An |
| Kassenbestand | `show_cash_balance` | An |
| Erstellt von (Manager-Name) | `show_created_by` | An |
| Kellner-Details (Umsatz, Abgabezeit) | `show_waiters` | An |
| Kueche-Details (Schichten, Stunden) | `show_kitchen` | An |

### Datenbankschema

Neue Tabelle `telegram_settings` (Singleton):

```text
telegram_settings
  id                      uuid PK default gen_random_uuid()
  bot_token               text NOT NULL default ''
  chat_id                 text NOT NULL default ''
  excluded_restaurants    uuid[] DEFAULT '{}'
  show_pos_total          boolean DEFAULT true
  show_guest_count        boolean DEFAULT true
  show_cash_balance       boolean DEFAULT true
  show_created_by         boolean DEFAULT true
  show_waiters            boolean DEFAULT true
  show_kitchen            boolean DEFAULT true
  created_at              timestamptz DEFAULT now()
  updated_at              timestamptz DEFAULT now()
```

### Seitenaufbau (TelegramSettings)

```text
+------------------------------------------+
|  Telegram Einstellungen                  |
+------------------------------------------+
|  Verbindung                              |
|  Bot-Token:    [**********]              |
|  Chat-ID:      [123456789]               |
+------------------------------------------+
|  Inhalt der Nachricht                    |
|  [x] Vectron (Tagesumsatz)              |
|  [x] Gaeste + Durchschnittsverbrauch    |
|  [x] Kassenbestand                       |
|  [x] Erstellt von                        |
|  [x] Kellner-Details                     |
|  [x] Kueche-Details                      |
+------------------------------------------+
|  Ausgeschlossene Restaurants             |
|  [ ] Yum                                 |
|  [ ] Restaurant 2                        |
+------------------------------------------+
|  Test senden                             |
|  Datum: [11.02.2026]      [Senden]       |
+------------------------------------------+
|              [Speichern]                 |
+------------------------------------------+
```

### Technische Umsetzung

**1. Datenbank-Migration**
- Neue Tabelle `telegram_settings` mit allen Feldern inkl. Toggle-Spalten
- RLS: SELECT, INSERT, UPDATE erlaubt; DELETE nicht

**2. Neue Dateien**

- `src/pages/TelegramSettings.tsx` -- Formular mit Verbindungsdaten, Switch-Toggles fuer jede Metrik, Restaurant-Ausschluesse, Test-Senden-Button
- `src/hooks/useTelegramSettings.ts` -- CRUD fuer `telegram_settings`, manuelles Senden

**3. Bestehende Dateien aendern**

- `src/App.tsx` -- Neue Route `/telegram` (ProtectedRoute, admin only)
- `src/components/layout/AppLayout.tsx` -- Neuer Sidebar-Link "Telegram" im Admin-Bereich
- `supabase/functions/send-telegram-summary/index.ts` -- Settings aus DB laden, Toggle-Felder auswerten (Abschnitte nur einbauen wenn `show_*` true), `excluded_restaurants` beruecksichtigen, Fallback auf Env-Secrets wenn DB leer

**4. Edge Function Anpassung (Pseudocode)**

```text
settings = lade aus telegram_settings (erste Zeile)
bot_token = settings.bot_token || env.TELEGRAM_BOT_TOKEN
chat_id = settings.chat_id || env.TELEGRAM_CHAT_ID

fuer jedes Restaurant (nicht in excluded_restaurants):
  wenn settings.show_pos_total:  -> Vectron-Zeile
  wenn settings.show_guest_count: -> Gaeste-Zeile
  wenn settings.show_cash_balance: -> Kassenbestand-Zeile
  wenn settings.show_created_by: -> Erstellt-von-Zeile
  wenn settings.show_waiters: -> Kellner-Block
  wenn settings.show_kitchen: -> Kueche-Block
```

### Was gleich bleibt
- Bargeld/Kassenbestand-Berechnung in der Edge Function bleibt identisch
- Bestehende Secrets funktionieren weiterhin als Fallback
- Nachrichtenformat bleibt gleich, nur Abschnitte werden ein-/ausgeblendet


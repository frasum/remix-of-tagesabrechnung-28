
# Taeglicher Tagesumsatz per Telegram

## Uebersicht
Automatischer Versand einer taeglichen Umsatz-Zusammenfassung fuer beide Restaurants (Spicery und YUM) an deinen Telegram-Chat.

## Schritt 1: Secrets speichern
Zwei Secrets werden sicher in Lovable Cloud hinterlegt:
- `TELEGRAM_BOT_TOKEN`: `8262361702:AAFh1kGWAwgu6hHTExsKtoWTT9_70ZX9KTmY`
- `TELEGRAM_CHAT_ID`: `6697169070`

## Schritt 2: Backend-Funktion erstellen

Neue Funktion `send-telegram-summary`, die:
1. Alle Restaurants laedt
2. Fuer das gestrige Datum die Session-Daten abruft (Umsatz, Bargeld, Kreditkarten)
3. Eine formatierte Nachricht erstellt und per Telegram Bot API sendet

Beispiel-Nachricht:
```text
Tagesumsatz 09.02.2026

Spicery:
  Umsatz: 3.245,80 EUR
  Bargeld: 1.120,50 EUR
  Karten: 1.890,30 EUR

YUM:
  Umsatz: 2.780,00 EUR
  Bargeld: 980,20 EUR
  Karten: 1.450,80 EUR
```

## Schritt 3: Automatischer taeglicher Versand
Ein Cron-Job in der Datenbank, der die Funktion taeglich um 06:00 Uhr morgens aufruft.

## Technische Details

| Bereich | Aenderung |
|---|---|
| Secrets | `TELEGRAM_BOT_TOKEN` und `TELEGRAM_CHAT_ID` hinterlegen |
| `supabase/functions/send-telegram-summary/index.ts` | Neue Funktion: Sessions abfragen, Nachricht formatieren, per Telegram API senden |
| `supabase/config.toml` | Funktion registrieren mit `verify_jwt = false` (fuer Cron-Aufruf) |
| Datenbank | `pg_cron` und `pg_net` Extensions aktivieren, Cron-Job anlegen (06:00 UTC) |

Die Funktion kann auch manuell aufgerufen werden (z.B. zum Testen), indem ein optionaler `date`-Parameter uebergeben wird.

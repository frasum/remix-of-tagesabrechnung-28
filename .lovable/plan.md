

## Plan: Settlement-Webhook (Zeiterfassung) entfernen

### Betroffene Dateien

**1. Edge Function löschen**
- `supabase/functions/send-settlement/index.ts` löschen

**2. Config bereinigen** (`supabase/config.toml`)
- Eintrag `[functions.send-settlement]` entfernen

**3. Client-Code bereinigen** (`src/pages/DailySummary.tsx`)
- `settlementSentRef` (Zeile 403) entfernen
- Settlement-Block Zeilen 425–441 entfernen (der `send-settlement` invoke-Aufruf)
- `session` aus den `useCallback`-Dependencies entfernen (Zeile 443)

### Nicht betroffen
- `notify-pdf-export` (Telegram PDF-Benachrichtigung) — bleibt
- `send-telegram-summary` (Tagesbericht) — bleibt
- Datenbankspalte `last_settlement_sent_at` — kann bestehen bleiben, keine Breaking Changes


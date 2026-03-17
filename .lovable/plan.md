

## Plan: Restaurant-Chat Timeout & fehlende Antworten beheben

### Problem
Die Edge Function `restaurant-chat` schlägt mit "Failed to fetch" fehl. Ursachen:
1. **Riesiger Kontext**: Alle `zt_shifts` werden ohne Datumsbegrenzung geladen (Zeile 150-153), was bei vielen Mitarbeitern über Monate hinweg zu einem enormen Kontext-String führt
2. **Token-Limit**: `gpt-4o-mini` hat ein kleineres Kontextfenster — der generierte Kontext sprengt wahrscheinlich das Limit
3. **Timeout**: Die Kombination aus Datenladen + großem API-Call überschreitet das 60s-Limit der Edge Function

### Lösung: `supabase/functions/restaurant-chat/index.ts`

**1. zt_shifts auf 6 Monate begrenzen**
- Statt alle zt_shifts zu laden (aktuell kein Datumsfilter), auf die letzten 6 Monate beschränken
- Das reduziert die Datenmenge und den Kontext massiv

**2. Kontext-Größe begrenzen**
- Nach dem Aufbau von `contextParts` die Gesamtlänge prüfen
- Falls zu groß: weniger granulare Sektionen kürzen (z.B. einzelne Schicht-Rohdaten, Wetter-Korrelation)

**3. Von OpenAI direkt auf Lovable AI Gateway migrieren**
- Statt `api.openai.com` → `ai.gateway.lovable.dev/v1/chat/completions`
- Statt `OPENAI_API_KEY` → `LOVABLE_API_KEY`
- Modell: `google/gemini-2.5-flash` (großes Kontextfenster, schnell, kostengünstig)
- Gemini 2.5 Flash hat ein 1M-Token-Kontextfenster, was das Problem mit zu großem Kontext grundlegend löst


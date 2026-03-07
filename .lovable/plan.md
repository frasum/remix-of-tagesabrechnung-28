

# Wetterdaten-Integration für den Restaurant-Chat

## Vorhaben
Die Open-Meteo API (kostenlos, kein API-Key nötig) wird in die Edge Function integriert, um Wetterdaten für München abzurufen. Die KI kann dann Umsatz-Wetter-Korrelationen analysieren — besonders relevant für Terrassen-Geschäft.

## Umsetzung in `supabase/functions/restaurant-chat/index.ts`

### 1. Wetterdaten abrufen
Parallel zu den bestehenden DB-Queries einen `fetch` an Open-Meteo hinzufügen:
- URL: `https://api.open-meteo.com/v1/forecast?latitude=48.14&longitude=11.58&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Europe/Berlin&past_days=90&forecast_days=3`
- Liefert: Temperatur (Max/Min), Niederschlag, Wetter-Code für die letzten 90 Tage + 3 Tage Vorhersage
- Fehler werden abgefangen — bei API-Ausfall wird der Chat ohne Wetterdaten fortgesetzt

### 2. Neuer Kontext-Abschnitt
```
=== WETTERDATEN MÜNCHEN (letzte 90 Tage + Vorhersage) ===
Datum | Max°C | Min°C | Niederschlag-mm | Wetter
2026-03-07 | 15.7 | 4.2 | 0.0 | Sonnig
...
```
Wetter-Codes werden in lesbare Labels übersetzt (Sonnig, Bewölkt, Regen, Schnee, etc.).

### 3. Tages-Korrelationstabelle
Automatische Zusammenführung von Wetter + Umsatz/Gäste pro Tag (letzte 30 Tage):
```
=== WETTER-UMSATZ-KORRELATION (letzte 30 Tage) ===
Datum | Restaurant | Max°C | Niederschlag | Wetter | Umsatz | Gäste
```

### 4. System-Prompt aktualisieren
- Die Zeile „Bei Wetter-Fragen: Erkläre, dass keine Wetterdaten verfügbar sind..." wird ersetzt durch:
  - „Die WETTERDATEN zeigen Temperatur und Niederschlag für München. Nutze die WETTER-UMSATZ-KORRELATION um Zusammenhänge zwischen Wetter und Umsatz/Gästezahlen zu analysieren. Besonders relevant für Terrassen-Tage (warm + trocken)."

### Kein API-Key nötig
Open-Meteo ist komplett kostenlos und öffentlich zugänglich — keine Secrets erforderlich.


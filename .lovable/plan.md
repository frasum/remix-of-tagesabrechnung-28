

## ElevenLabs Voice-Chat im Restaurant-Assistenten

### Was wird gebaut
Der bestehende Text-Chat bekommt zwei Voice-Features:
1. **Mikrofon-Button** neben dem Textfeld — Sprache wird per ElevenLabs STT in Text umgewandelt und als normale Nachricht gesendet
2. **Lautsprecher-Button** an jeder Assistenten-Antwort — liest die Antwort per ElevenLabs TTS vor

### Architektur

```text
┌─ Frontend (RestaurantChat.tsx) ──────────────┐
│                                                │
│  🎤 Mic-Button → MediaRecorder → Audio Blob   │
│       ↓                                        │
│  fetch(/elevenlabs-stt)  → Transkript → sendMessage()
│                                                │
│  🔊 Speaker-Button auf Antwort                │
│       ↓                                        │
│  fetch(/elevenlabs-tts)  → Audio Blob → play() │
└────────────────────────────────────────────────┘
```

### Neue Edge Functions (2)

**1. `supabase/functions/elevenlabs-stt/index.ts`**
- Empfängt FormData mit Audio-Datei
- Leitet an `https://api.elevenlabs.io/v1/speech-to-text` mit `model_id: scribe_v2`, `language_code: deu`
- Gibt `{ text: "..." }` zurück

**2. `supabase/functions/elevenlabs-tts/index.ts`**
- Empfängt `{ text, voiceId }` als JSON
- Ruft `https://api.elevenlabs.io/v1/text-to-speech/{voiceId}` auf mit `eleven_multilingual_v2`
- Gibt rohes Audio (MP3) als Binary zurück

### Frontend-Änderungen (`RestaurantChat.tsx`)

- **Mikrofon-Button**: Neben dem Send-Button. Klick startet Aufnahme (MediaRecorder), erneuter Klick stoppt und sendet an STT Edge Function. Transkript wird als User-Nachricht gesendet.
- **Speaker-Button**: Kleines Volume-Icon an jeder Assistant-Nachricht. Klick ruft TTS Edge Function und spielt Audio ab.
- **States**: `isRecording`, `isSpeaking` (pro Nachricht-Index)
- **Dependency**: Keine neue npm-Abhängigkeit nötig (nutzt native MediaRecorder + fetch)

### config.toml
- Beide neuen Functions mit `verify_jwt = false` eintragen


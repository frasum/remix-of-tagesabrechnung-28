
## Inaktivitäts-Logout auf 30 Minuten erhöhen

### Analyse
Das Inaktivitäts-Timeout-Feature wurde noch nicht implementiert. Der geplante Ansatz war, folgende Komponenten zu erstellen:
- `useInactivityTimeout` Hook für Aktivitäts-Tracking
- `SessionLockScreen` Komponente für PIN-Bestätigung
- Erweiterung von `AuthContext.tsx` mit `isLocked` und `lockSession()` Methoden

Der Nutzer möchte das Timeout auf **30 Minuten** (statt initial geplant 5 Minuten) setzen.

### Implementierungsplan

#### 1. Neue Hook: `src/hooks/useInactivityTimeout.ts`
- Überwacht Benutzeraktivitäten (`mousedown`, `keydown`, `touchstart`, `scroll`)
- Speichert letzten Aktivitätszeitpunkt
- Triggert `lockSession()` nach 30 Minuten Inaktivität
- Setzt Timer nur wenn Benutzer angemeldet und nicht gesperrt ist

#### 2. AuthContext erweitern: `src/contexts/AuthContext.tsx`
- Neue Properties: `isLocked: boolean` und `lastActivity: number`
- Neue Methoden:
  - `lockSession()`: Sperrt Session (zeigt Lock Screen)
  - `unlockSession(pin: string)`: Verifiziert PIN via neuer Edge Function
- Timeout-Konstante: `30 * 60 * 1000` (30 Minuten)

#### 3. SessionLockScreen Komponente: `src/components/auth/SessionLockScreen.tsx`
- Zeigt angemeldeten Benutzer
- PIN-Eingabefeld mit Ziffern
- Button "Bestätigen" (ruft `unlockSession()` auf)
- Button "Anderer Benutzer" (navigiert zu Login, setzt Logout)
- Styled mit bestehenden Components (Input, Button, Card)

#### 4. App.tsx anpassen
- Prüft `isLocked` und rendert `SessionLockScreen` wenn `true`
- Lock Screen wird über allen anderen Komponenten angezeigt

#### 5. Neue Edge Function: `supabase/functions/verify-session-pin/index.ts`
- POST Endpoint
- Body: `{ staff_id: string, pin_code: string }`
- Verifiziert PIN gegen `staff_pins` Tabelle ohne Name-Parameter
- Returns: `{ valid: boolean }`

### Dateiänderungen im Überblick

| Datei | Typ | Beschreibung |
|-------|-----|-------------|
| `src/hooks/useInactivityTimeout.ts` | NEU | Hook für 30-Min Inaktivitäts-Tracking |
| `src/contexts/AuthContext.tsx` | EDIT | `isLocked`, `lockSession`, `unlockSession` hinzufügen |
| `src/components/auth/SessionLockScreen.tsx` | NEU | Lock Screen Komponente mit PIN-Eingabe |
| `src/App.tsx` | EDIT | SessionLockScreen conditional rendern |
| `supabase/functions/verify-session-pin/index.ts` | NEU | Edge Function zur PIN-Verifizierung |

### Sicherheitsmerkmale
- **30 Minuten Timeout**: Praktisch für Restaurant-Alltag, genug Zeit ohne OAuth-Neuanmeldung
- **PIN-Bestätigung**: Verhindert unbefugte Nutzung geteilter Geräte
- **Schneller Benutzerwechsel**: "Anderer Benutzer" Button ohne vollständigen Logout
- **Eventbasiertes Tracking**: Timer wird bei jeder Aktivität zurückgesetzt

### Konfigurierbarkeit
Die 30 Minuten sind leicht anpassbar durch Änderung der Konstante in `useInactivityTimeout.ts`.

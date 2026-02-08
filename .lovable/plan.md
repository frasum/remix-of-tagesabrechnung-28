
# Google/Apple Login für Kellner Self-Service

## Übersicht
Erweiterung des Kellner Self-Service Systems um Google/Apple OAuth-Login als schnellere Alternative zum PIN-Login. Die Kellner können dann mit einem Klick über ihr Smartphone einloggen, anstatt Name und PIN einzugeben.

## Aktueller Stand

Das System unterstützt bereits:
- PIN-basierte Authentifizierung für Kellner
- Google/Apple OAuth auf der Login-Seite
- Konto-Verknüpfung für OAuth-Nutzer mit bestehenden Mitarbeiter-Profilen
- Mobile Self-Service Oberfläche (`/waiter`)

## Änderungen

### 1. Login-Seite verbessern
Anpassung der Weiterleitung nach OAuth-Login, um den Restaurant-Kontext beizubehalten:
- Nach erfolgreichem Login → Weiterleitung zu `/{restaurant}/waiter` statt `/spicery/waiter`
- Speicherung des ursprünglichen Restaurant-Slugs vor dem OAuth-Flow

### 2. QR-Code Poster aktualisieren
Das Poster zeigt aktuell nur die PIN-Login Methode. Erweiterung um:
- Hinweis auf "Mit Google/Apple anmelden" als Alternative
- Aktualisierte Schritt-Anleitung (PIN oder Social Login)

### 3. WaiterQRCode Komponente erweitern
Im Manager-Dashboard die Info ergänzen:
- Hinweis dass auch Google/Apple Login möglich ist

### 4. OAuth-Redirect mit Restaurant-Kontext
Sicherstellen, dass nach dem OAuth-Callback der richtige Restaurant-Kontext wiederhergestellt wird:
- Restaurant-Slug in localStorage speichern vor OAuth-Redirect
- Nach Rückkehr zum richtigen Restaurant weiterleiten

---

## Technische Details

### Login.tsx Änderungen

```typescript
// Vor OAuth-Login den aktuellen Pfad speichern
const handleGoogleSignIn = async () => {
  // Restaurant-Slug aus URL extrahieren falls vorhanden
  const pathMatch = window.location.pathname.match(/^\/([^/]+)/);
  if (pathMatch && pathMatch[1] !== 'login') {
    localStorage.setItem('oauth_redirect_restaurant', pathMatch[1]);
  }
  
  setIsLoading(true);
  const result = await lovable.auth.signInWithOAuth('google', {
    redirect_uri: window.location.origin,
  });
  // ...
};
```

### AuthContext.tsx Änderungen

```typescript
// Nach OAuth-Login zum gespeicherten Restaurant weiterleiten
const getOAuthRedirectPath = (isMobile: boolean) => {
  const savedRestaurant = localStorage.getItem('oauth_redirect_restaurant');
  localStorage.removeItem('oauth_redirect_restaurant');
  const restaurant = savedRestaurant || 'spicery';
  return isMobile ? `/${restaurant}/waiter` : `/${restaurant}`;
};
```

### WaiterQRPoster.tsx Änderungen

Schritt 2 erweitern:
```tsx
{/* Step 2 - Updated */}
<div className="flex items-start gap-4">
  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary ...">
    2
  </div>
  <div className="flex-1 pt-2">
    <div className="flex items-center gap-2 mb-1">
      <LogIn className="w-5 h-5 text-primary" />
      <span className="font-semibold">Anmelden</span>
    </div>
    <p className="text-muted-foreground text-sm">
      Mit Google/Apple anmelden <strong>oder</strong> Name & PIN eingeben
    </p>
  </div>
</div>
```

### Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/pages/Login.tsx` | OAuth mit Restaurant-Kontext speichern |
| `src/contexts/AuthContext.tsx` | Redirect-Pfad aus localStorage lesen |
| `src/pages/WaiterQRPoster.tsx` | Anleitung um OAuth-Option erweitern |
| `src/components/manager/WaiterQRCode.tsx` | Info-Text erweitern |

## Benutzer-Flow nach Implementierung

```text
┌─────────────────────────────────────────────────────────┐
│  Kellner scannt QR-Code (/spicery/waiter)               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Nicht eingeloggt → Weiterleitung zu /login             │
│  (Restaurant-Slug wird gespeichert)                     │
└─────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
   ┌────────────────┐          ┌────────────────┐
   │  PIN-Login     │          │  Google/Apple  │
   │  (Name + Code) │          │  (1-Klick)     │
   └────────────────┘          └────────────────┘
            │                           │
            └─────────────┬─────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Zurück zu /spicery/waiter (Self-Service)               │
│  → Konto-Verknüpfung falls OAuth-Nutzer ohne Staff-ID   │
└─────────────────────────────────────────────────────────┘
```

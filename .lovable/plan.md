
# Fix: App bleibt bei "Laden..." hängen

## Problem-Analyse

Die App zeigt dauerhaft "Laden..." an, weil der `AuthContext` nie `setIsLoading(false)` aufruft. 

**Ursache:** Die `initAuth()` Funktion hat fehlendes Error-Handling:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    FEHLER-FLOW IM AUTHCONTEXT                   │
├─────────────────────────────────────────────────────────────────┤
│  1. localStorage hat OAuth-User (isOAuthUser: true)             │
│  2. getSession() gibt Session zurück                            │
│  3. convertOAuthUser() wird aufgerufen                          │
│  4. ❌ convertOAuthUser() hängt oder wirft Fehler               │
│  5. catch-Block entfernt nur localStorage                       │
│  6. ❌ setIsLoading(false) wird NICHT aufgerufen                │
│  7. ➜ App bleibt ewig im Ladezustand                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Lösung

### 1. Error-Handling in `initAuth()` verbessern

**Datei:** `src/contexts/AuthContext.tsx`

Wrappen der gesamten `initAuth()` Funktion in try-catch mit garantiertem `setIsLoading(false)`:

```typescript
const initAuth = async () => {
  try {
    // ... existing logic
  } catch (error) {
    console.error('Auth initialization failed:', error);
  } finally {
    // GARANTIERT dass Loading endet
    setIsLoading(false);
  }
};
```

### 2. Timeout für `convertOAuthUser()` hinzufügen

Um zu verhindern, dass die Funktion ewig hängt:

```typescript
const convertOAuthUserWithTimeout = async (user: User, timeoutMs = 5000) => {
  const timeout = new Promise<AuthUser>((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  return Promise.race([convertOAuthUser(user), timeout]);
};
```

### 3. Fallback bei fehlgeschlagener Session-Verarbeitung

Wenn OAuth-User im localStorage ist aber Session-Refresh fehlschlägt, den gespeicherten User nutzen (ohne Session-Validierung):

```typescript
if (parsed.isOAuthUser) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const authUser = await convertOAuthUser(session.user);
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return; // setIsLoading(false) in finally
    }
  } catch (e) {
    console.error('OAuth session refresh failed, using cached user:', e);
  }
  // Fallback: Use cached user data
  setUser(parsed);
  return;
}
```

---

## Änderungen im Detail

| Datei | Änderung |
|-------|----------|
| `src/contexts/AuthContext.tsx` | `try/finally` Block um `initAuth()`, Timeout für `convertOAuthUser`, besseres Fallback-Handling |

---

## Vorher/Nachher

**Vorher (problematisch):**
```typescript
const initAuth = async () => {
  if (storedUser) {
    try {
      if (parsed.isOAuthUser) {
        // ❌ Wenn convertOAuthUser fehlschlägt...
        const authUser = await convertOAuthUser(session.user);
        setIsLoading(false); // ...wird das nie erreicht
        return;
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      // ❌ setIsLoading(false) fehlt hier!
    }
  }
  // ... rest
  setIsLoading(false); // ❌ Wird nur bei Erfolg erreicht
};
```

**Nachher (robust):**
```typescript
const initAuth = async () => {
  try {
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.isOAuthUser) {
        // Timeout verhindert endloses Hängen
        const authUser = await Promise.race([
          convertOAuthUser(session.user),
          new Promise((_, reject) => setTimeout(() => reject('Timeout'), 5000))
        ]).catch(() => parsed); // Fallback auf cached User
        
        setUser(authUser);
        return;
      }
      setUser(parsed);
      return;
    }
    // ... OAuth session check
  } catch (error) {
    console.error('Auth init failed:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } finally {
    setIsLoading(false); // ✅ IMMER ausgeführt
  }
};
```

---

## Ergebnis

Nach der Implementierung:

1. Die App wird nie mehr ewig bei "Laden..." hängen bleiben
2. Auch bei Netzwerkfehlern oder Session-Problemen wird die Login-Seite gezeigt
3. OAuth-User mit gültiger cached Session können die App weiter nutzen, auch wenn der Server temporär nicht erreichbar ist

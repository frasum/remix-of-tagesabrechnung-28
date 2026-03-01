

## Problem

In `handleRoleSelected` (Login.tsx, Zeile 109-128), wird `permissionLevel` nur in `localStorage` auf `'staff'` gesetzt, aber der AuthContext-State (`user`) wird nicht aktualisiert. Die App verwendet den In-Memory-State, nicht localStorage, fuer Berechtigungspruefungen. Daher bleibt `user.permissionLevel` auf `'manager'` und Mo sieht das volle Dashboard.

Zusaetzlich: Beim Laden aus localStorage (AuthContext, Zeile 212-215) wird der gecachte User direkt uebernommen. Aber der Background-Refresh (Zeile 217-233) holt die **Server-seitige** Permission und ueberschreibt das lokale `'staff'` wieder mit `'manager'` — weil der Server nichts von der Rollenauswahl weiss.

## Loesung

**Datei: `src/pages/Login.tsx`** — `handleRoleSelected` anpassen:

Nach dem Update von localStorage muss auch der AuthContext-User aktualisiert werden. Da `setUser` nicht direkt verfuegbar ist, muss `login` nicht erneut aufgerufen werden. Stattdessen: Den gespeicherten User aus localStorage parsen, modifizieren, und ueber ein **window reload** oder einen neuen Mechanismus den AuthContext synchronisieren.

Einfachste und zuverlaessigste Loesung: Nach dem Setzen in localStorage ein `window.location.replace('/select-restaurant')` statt `navigate()` verwenden. Dadurch liest `initAuth` den aktualisierten localStorage-Wert beim Neustart.

**Aber**: Der Background-Refresh (AuthContext Zeile 217-233) wuerde `permissionLevel` wieder auf `'manager'` setzen, weil der Server die aktive Rolle nicht kennt.

Daher bessere Loesung: Ein Flag `activeRole` im localStorage speichern (bereits vorhanden als `parsed.activeRole`), und im AuthContext den Background-Refresh so anpassen, dass er `permissionLevel` **nicht** ueberschreibt, wenn `activeRole` gesetzt ist und nicht `'gl'` ist.

### Aenderungen:

1. **`src/pages/Login.tsx`** (Zeile 122-127): Nach localStorage-Update `window.location.replace` statt `navigate` verwenden, damit der AuthContext den aktualisierten User aus localStorage liest.

2. **`src/contexts/AuthContext.tsx`** (Zeile 217-233): Beim Background-Refresh pruefen ob `activeRole` gesetzt und nicht `'gl'` ist — in dem Fall `permissionLevel` auf `'staff'` belassen und nicht vom Server ueberschreiben.

### Konkrete Code-Aenderungen:

**Login.tsx** — `handleRoleSelected`:
```typescript
const handleRoleSelected = (role: ActiveRole) => {
  const stored = localStorage.getItem('spicery_auth_user');
  if (stored) {
    const parsed = JSON.parse(stored);
    parsed.role = role === 'gl' ? 'waiter' : role;
    parsed.activeRole = role;
    if (role !== 'gl') {
      parsed.permissionLevel = 'staff';
    }
    localStorage.setItem('spicery_auth_user', JSON.stringify(parsed));
  }
  setPendingRoleSelection(null);
  // Full page reload so AuthContext reads updated localStorage
  window.location.replace('/select-restaurant');
};
```

**AuthContext.tsx** — Background-Refresh (Zeile 223-230): activeRole-Guard hinzufuegen:
```typescript
if (response.ok && isMounted) {
  const roleData = await response.json();
  const newLevel = roleData.permission_level || 'staff';
  // Don't override permission if user chose a non-GL active role
  const effectiveLevel = parsed.activeRole && parsed.activeRole !== 'gl' 
    ? 'staff' 
    : newLevel;
  if (effectiveLevel !== parsed.permissionLevel) {
    const updated = { ...parsed, permissionLevel: effectiveLevel };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  }
}
```


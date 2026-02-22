
## Problem: Veraltete Berechtigungen aus dem Cache

### Ursache

Wenn sich ein Nutzer per PIN einloggt, wird das Benutzerprofil (einschliesslich `permissionLevel`) im `localStorage` gespeichert. Beim naechsten App-Start wird dieses gespeicherte Profil **ohne Aktualisierung** direkt verwendet (Zeilen 160-168 in `AuthContext.tsx`).

Das bedeutet:
- Wenn sich die Berechtigungsstufe in der Datenbank aendert (z.B. von "manager" auf "admin"), zeigt die App weiterhin die **alte** Stufe an
- Erst ein erneuter Login holt die aktuellen Daten vom Server

Bei OAuth-Nutzern wird das Profil beim App-Start aktualisiert -- bei PIN-Nutzern jedoch **nicht**.

### Auswirkung

- `isSessionLocked()` nutzt `permissionLevel` und sperrt aeltere Sessions fuer Nicht-Admins
- Bestimmte UI-Elemente (z.B. Admin-Einstellungen) werden basierend auf `permissionLevel` ein-/ausgeblendet
- Daten koennten veraltet dargestellt werden, weil der React-Query-Cache aus einer vorherigen Sitzung stammt

### Loesung

**Datei: `src/contexts/AuthContext.tsx`**

Bei PIN-basierten Nutzern (die eine `staffId` haben, aber kein `isOAuthUser` sind) beim App-Start automatisch die Berechtigungen vom Server aktualisieren:

1. Nach dem Laden des PIN-Nutzers aus dem `localStorage` (Zeile ~160) wird der Nutzer sofort angezeigt (fuer schnelle Ladezeiten)
2. Im Hintergrund wird `refreshPermissions()` aufgerufen, um die aktuelle `permissionLevel` vom Server zu holen
3. Falls sich die Stufe geaendert hat, wird der Nutzer-State und der `localStorage` aktualisiert

Konkret wird der Block ab Zeile 160 erweitert:

```text
Vorher:
  // PIN-based user
  if (isMounted) {
    setUser(parsed);
    setIsLoading(false);
  }
  return;

Nachher:
  // PIN-based user - show cached immediately, refresh permissions in background
  if (isMounted) {
    setUser(parsed);
    setIsLoading(false);
  }
  // Background refresh of permission level
  if (parsed.staffId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-role?staff_id=${parsed.staffId}`,
        { headers: { 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      if (response.ok && isMounted) {
        const roleData = await response.json();
        const newLevel = roleData.permission_level || 'staff';
        if (newLevel !== parsed.permissionLevel) {
          const updated = { ...parsed, permissionLevel: newLevel };
          setUser(updated);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        }
      }
    } catch { /* silent - cached data is still usable */ }
  }
  return;
```

### Vorteile

- **Keine Verzoegerung**: Der Nutzer sieht sofort die gecachte Version (schneller Start)
- **Aktualitaet**: Im Hintergrund werden Berechtigungen aktualisiert -- die UI passt sich automatisch an
- **Fehlerresistent**: Bei Netzwerkproblemen funktioniert weiterhin der gecachte Wert

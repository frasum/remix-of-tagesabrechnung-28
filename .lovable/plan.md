

## Problem

Es gibt zwei Bugs:

### Bug 1: Rollenauswahl-Dialog verschwindet sofort
In `Login.tsx` (Zeile 62-66) gibt es einen `useEffect`, der bei jeder Aenderung von `user` sofort nach `/select-restaurant` navigiert. Wenn `login()` erfolgreich ist, wird der User im AuthContext gesetzt, was diesen useEffect triggert -- **bevor** der Rollenauswahl-Dialog angezeigt werden kann. Der Dialog blitzt nur kurz auf und wird dann durch die Navigation verdraengt.

### Bug 2: Doppelte Restaurant-Eintraege
"Spicery" erscheint zweimal in der Restaurant-Auswahl. Das deutet auf doppelte Eintraege in der `staff_restaurants`-Tabelle fuer diesen Mitarbeiter hin. Das muss in der Datenbank geprueft und bereinigt werden.

## Loesung

### Datei: `src/pages/Login.tsx`

**useEffect anpassen** (Zeile 62-66): Der Redirect soll nur erfolgen, wenn **kein** `pendingRoleSelection` aktiv ist.

```typescript
useEffect(() => {
  if (user && !pendingRoleSelection) {
    navigate('/select-restaurant', { replace: true });
  }
}, [user, navigate, pendingRoleSelection]);
```

### Datei: `src/pages/RestaurantSelect.tsx`

**Duplikate entfernen**: Die gemappten Restaurants nach `id` deduplizieren, damit selbst bei doppelten DB-Eintraegen jedes Restaurant nur einmal angezeigt wird.

```typescript
const mapped = data
  .map((sr: any) => sr.restaurants as Restaurant)
  .filter(Boolean);

// Deduplizieren nach ID
const unique = Array.from(new Map(mapped.map(r => [r.id, r])).values());
```

Dann `unique` statt `mapped` fuer die `setRestaurants()` und die Einzel-Restaurant-Logik verwenden.


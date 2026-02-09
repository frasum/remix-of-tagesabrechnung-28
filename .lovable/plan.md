
# Restaurant-Switcher auf zugewiesene Restaurants beschraenken

## Problem

Der Restaurant-Switcher in der Sidebar (`AppLayout.tsx`) zeigt **alle** Restaurants an, nicht nur die, denen der Mitarbeiter zugeordnet ist. Das liegt daran, dass `useRestaurants()` in `RestaurantContext.tsx` einfach `SELECT * FROM restaurants` ausfuehrt -- ohne Filterung nach `staff_restaurants`.

## Loesung

Den `useRestaurants()`-Hook so anpassen, dass er nur die Restaurants zurueckgibt, denen der eingeloggte Mitarbeiter zugeordnet ist. Admins sehen weiterhin alle Restaurants.

## Aenderungen

### 1. `src/contexts/RestaurantContext.tsx` -- `useRestaurants` anpassen

- Die `staffId` und `permissionLevel` aus dem `AuthContext` nutzen
- Fuer **Admins**: Weiterhin alle Restaurants laden (damit sie ueberall Zugriff haben)
- Fuer **alle anderen**: Nur Restaurants laden, die ueber `staff_restaurants` verknuepft sind
- Query ueber `staff_restaurants` mit Join auf `restaurants` filtern (gleiche Logik wie in `RestaurantSelect.tsx`)

### 2. `src/hooks/useRestaurant.ts` -- Re-Export bleibt unveraendert

Keine Aenderung noetig, da der Hook weiterhin aus dem Context re-exportiert wird.

## Technische Details

```text
Vorher:
  useRestaurants() -> SELECT * FROM restaurants

Nachher (Staff/Manager):
  useRestaurants() -> SELECT restaurant_id, restaurants(*)
                      FROM staff_restaurants
                      WHERE staff_id = :staffId

Nachher (Admin):
  useRestaurants() -> SELECT * FROM restaurants (unveraendert)
```

- Die gleiche Abfrage-Logik existiert bereits in `RestaurantSelect.tsx` und wird hier wiederverwendet
- Der `queryKey` erhaelt die `staffId` als Abhaengigkeit, damit der Cache korrekt invalidiert wird
- Kein Datenbankumbau noetig -- die Tabelle `staff_restaurants` existiert bereits

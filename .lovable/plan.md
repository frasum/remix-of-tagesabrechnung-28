

# Fix: Restaurant-Kontext beim Login automatisch korrekt setzen

## Problem
Wenn ein Nutzer sich abmeldet und ein anderer sich anmeldet (z.B. Admin -> Andre), bleiben die gecachten Restaurant-Daten des vorherigen Nutzers im Speicher. Andre sieht dann kurzzeitig das falsche Restaurant (z.B. "Spicery" statt "YUM") und muss manuell im Switcher umschalten.

**Ursache:** Beim Logout wird der React Query Cache nicht geleert. Durch die 2-Minuten-Cache-Dauer (`staleTime`) werden die Restaurant-Daten des vorherigen Nutzers noch angezeigt.

## Loesung

### 1. Cache beim Logout leeren (`src/contexts/AuthContext.tsx`)
In der `logout`-Funktion den gesamten React Query Cache leeren, damit der naechste Nutzer frische Daten bekommt.

Dazu muss der `QueryClient` importiert und `queryClient.clear()` beim Logout aufgerufen werden. Da der `QueryClient` in `App.tsx` erstellt wird und `AuthContext` innerhalb des `QueryClientProvider` liegt, kann `useQueryClient()` direkt verwendet werden.

```text
Aenderung in AuthProvider:
- useQueryClient() importieren
- In der logout-Funktion queryClient.clear() aufrufen
```

### 2. Restaurant-Switcher nur bei mehreren Restaurants anzeigen (`src/components/layout/AppLayout.tsx`)
Aktuell ist der Restaurant-Name immer als Dropdown dargestellt, auch wenn der Nutzer nur ein einziges Restaurant hat. Das ist irritierend, weil es suggeriert, dass man etwas auswaehlen muss.

```text
Aenderung:
- Wenn restaurants.length <= 1: Restaurant-Name als einfacher Text (kein Dropdown)
- Wenn restaurants.length > 1: Restaurant-Name als Dropdown wie bisher
```

Dies betrifft sowohl den mobilen Header als auch die Desktop-Sidebar.

## Technische Details

### Datei 1: `src/contexts/AuthContext.tsx`
- `useQueryClient` aus `@tanstack/react-query` importieren
- In der `logout`-Funktion `queryClient.clear()` vor `setUser(null)` aufrufen

### Datei 2: `src/components/layout/AppLayout.tsx`
- Bedingung einfuegen: `restaurants.length > 1`
  - Wenn ja: Dropdown-Menue wie bisher
  - Wenn nein: einfaches `<span>` mit dem Restaurant-Namen (ohne ChevronDown, ohne klickbare Auswahl)
- Gilt fuer beide Stellen (mobiler Header und Desktop-Sidebar)

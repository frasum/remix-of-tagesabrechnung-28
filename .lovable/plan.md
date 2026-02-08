
# Plan: Multi-Restaurant Unterstützung - Implementierung

## Phase 1: Datenbank-Änderungen

### 1.1 Neue Tabelle: `restaurants`

Eine neue Tabelle um die Restaurants zu verwalten:

```sql
CREATE TABLE public.restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

Dann werden die Initial-Daten eingefügt:
```sql
INSERT INTO public.restaurants (name, slug) VALUES 
  ('Spicery', 'spicery'),
  ('YUM', 'yum');
```

### 1.2 Neue Spalte `restaurant_id` zu bestehenden Tabellen

Diese Tabellen bekommen eine neue Spalte `restaurant_id` mit Foreign Key zur `restaurants` Tabelle:
- `sessions`
- `bank_deposits` 
- `settings`

**Beispiel für `sessions` Tabelle:**
```sql
ALTER TABLE public.sessions ADD COLUMN restaurant_id uuid NOT NULL DEFAULT <default-restaurant-id>;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_restaurant_id_fkey 
  FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id);
```

Die anderen Tabellen (`waiter_shifts`, `kitchen_shifts`, `card_transactions`, `expenses`) bleiben unverändert da sie über `session_id` automatisch dem Restaurant zugeordnet sind.

### 1.3 RLS Policies

Die bestehenden RLS Policies (derzeit alle `USING (true)` für öffentlichen Zugriff) werden beibehalten, da das System bereits so funktioniert.

---

## Phase 2: Frontend - Context für Restaurant-Auswahl

### 2.1 Neuer Context: `RestaurantContext`

Eine neue Datei `src/contexts/RestaurantContext.tsx` wird erstellt, die:
- Liest den Restaurant-Slug aus der URL Parameter (z.B. `:restaurant`)
- Lädt die aktuelle Restaurant-ID aus der Datenbank
- Stellt `restaurantId` für alle Komponenten bereit
- Speichert den Restaurant-Namen für UI-Anzeige

### 2.2 Neuer Hook: `useRestaurant`

Eine neue Datei `src/hooks/useRestaurant.ts` wird erstellt als einfacher Hook um:
- Auf `RestaurantContext` zuzugreifen
- Restaurant-ID für Database-Queries zu verwenden

---

## Phase 3: Frontend - Routing-Anpassung

### 3.1 App.tsx - Route Struktur

Die Routen werden reorganisiert um den `:restaurant` Parameter zu akzeptieren:

```
/login                        → Global (unverändert)
/staff                        → Global (unverändert)

/:restaurant/                 → Waiter CashUp für das Restaurant
/:restaurant/manager          → Manager Dashboard
/:restaurant/cash-balance     → Bargeldbestand
/:restaurant/kitchen          → Kitchen Tip Split
/:restaurant/summary          → Daily Summary
/:restaurant/statistics       → Statistics
/:restaurant/history          → History
/:restaurant/qr-poster        → QR Poster
```

Die ProtectedRoute-Komponente wird um Restaurant-Kontext erweitert.

### 3.2 Fallback für alte URLs

Wenn ein User auf `/` kommt (ohne Restaurant), wird er zu `/spicery/` weitergeleitet.

---

## Phase 4: Frontend - Komponenten-Anpassungen

### 4.1 AppLayout - Restaurant-Anzeige und Wechsel

Die Sidebar wird erweitert um:
- **Restaurant-Name im Header**: Zeigt aktuelles Restaurant an
- **Restaurant-Dropdown**: Ermöglicht Wechsel zwischen Spicery und YUM
- **Lokale Links**: Navigation wird automatisch mit dem Restaurant-Prefix generiert

```
┌──────────────────────┐
│ € Spicery      ▼     │  ← Dropdown
├──────────────────────┤
│ Kellner Abrechnung   │
│ Manager Dashboard    │
│ ...                  │
└──────────────────────┘
```

### 4.2 Hooks - restaurant_id Filter hinzufügen

Alle Data-Hooks werden erweitert um `restaurant_id` Filter:

**Beispiel für `useSession.ts`:**
```typescript
const { restaurantId } = useRestaurant();

query.eq('restaurant_id', restaurantId)
```

Betroffene Hooks:
- `useSession.ts`
- `useCashBalanceData.ts`
- `useBankDeposits.ts`
- `useSettings.ts`

### 4.3 Export-Funktionen

PDF und Excel Export werden erweitert um:
- Restaurant-Namen in Titel hinzufügen
- Restaurant-ID für korrekte Daten-Filterung verwenden

---

## Phase 5: Datenmigration

Bei Deployment werden alle bestehenden Daten automatisch dem Restaurant "Spicery" zugeordnet:

```sql
-- Get the Spicery restaurant ID
UPDATE public.sessions 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'spicery');

UPDATE public.bank_deposits 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'spicery');

UPDATE public.settings 
SET restaurant_id = (SELECT id FROM public.restaurants WHERE slug = 'spicery');
```

---

## Implementierungs-Reihenfolge

1. **Datenbank**: `restaurants` Tabelle erstellen + Migrationen für `restaurant_id` Spalten
2. **Frontend**: `RestaurantContext` und `useRestaurant` Hook
3. **Frontend**: `App.tsx` Routing-Anpassung
4. **Frontend**: `AppLayout` Restaurant-Anzeige und -Wechsel
5. **Frontend**: Alle Hooks mit `restaurant_id` Filter
6. **Frontend**: Export-Funktionen anpassen
7. **Test**: Beide Restaurants durchspielen

---

## Wichtige Hinweise

- **Alte URLs**: Nach der Änderung funktionieren alte Bookmarks nicht mehr (z.B. `/cash-balance` statt `/:restaurant/cash-balance`). Ein Redirect auf `/spicery/cash-balance` könnte implementiert werden als Optional.
- **Shared Staff**: Mitarbeiter können in beiden Restaurants arbeiten - ein Kellner hat nur einen Eintrag in der `staff` Tabelle
- **Gemeinsame Login**: Ein Nutzer mit Zugriff auf beide Restaurants kann einfach zwischen den URLs wechseln
- **URL-basiert**: Jedes Restaurant hat eigene URLs die bookmarkbar und sharebar sind


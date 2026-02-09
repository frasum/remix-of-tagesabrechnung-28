

# Fix: Lam sieht weiterhin nicht zugewiesene Navigationseintraege

## Analyse

Nach Pruefung der Datenbank und des Codes gibt es **zwei separate Probleme**, die zusammen dafuer sorgen, dass Lam falsche Navigationseintraege sieht:

### Problem 1: Pfad-Mismatch zwischen Datenbank und Sidebar

Die Datenbank speichert fuer Lam die Pfade: `manager`, `kitchen`, `summary`

Die Sidebar (`allNavItems` in AppLayout.tsx) verwendet aber diese Pfade: `''` (Kellner Abrechnung), `kitchen`, `summary`, `register-balance`, `statistics`, `history`, `cash-balance`

Der Pfad `manager` aus der Datenbank existiert nicht in `allNavItems`. Die Filterlogik in Zeile 93-95 prueft `managerPaths.includes(item.path)`, aber `''` (Kellner Abrechnung) ist nicht in Lams DB-Pfaden -- dafuer steht dort `manager`, das gar nicht in der Sidebar vorkommt.

### Problem 2: alwaysVisibleForManager-Whitelist

Zeile 76 definiert:
```text
alwaysVisibleForManager = ['', 'summary', 'kitchen', 'register-balance']
```

Diese Pfade werden in Zeile 85 **vor** jeder Berechtigungspruefung angezeigt. `register-balance` wird Lam dadurch immer aufgezwungen, unabhaengig von seinen DB-Berechtigungen.

### Ergebnis fuer Lam

Lam sieht: Kellner Abrechnung (Whitelist), Kuechen Trinkgeld (Whitelist), Tagesabrechnung (Whitelist), Wechselgeldbestand (Whitelist) -- plus moeglicherweise weitere Items, wenn `hasCustomPermissions` trotz vorhandener DB-Eintraege nicht greift.

Da `managerPaths` = `['manager', 'kitchen', 'summary']` und `managerPaths.length > 0` ist, ist `hasCustomPermissions = true`. Dann prueft der Filter `managerPaths.includes(item.path)`:
- `''` (Kellner Abrechnung): NICHT in managerPaths, aber in Whitelist -> sichtbar
- `kitchen`: in managerPaths UND Whitelist -> sichtbar
- `summary`: in managerPaths UND Whitelist -> sichtbar
- `register-balance`: NICHT in managerPaths, aber in Whitelist -> sichtbar
- `statistics`: NICHT in managerPaths, NICHT in Whitelist -> **versteckt**
- `history`: NICHT in managerPaths -> **versteckt**
- `cash-balance`: NICHT in managerPaths -> **versteckt**

**Wenn der Fix (staffId) korrekt greift**, sollten statistics, history und cash-balance tatsaechlich schon versteckt sein. Das Problem koennte sein, dass Lam sich **vor dem Fix** eingeloggt hat und die alte Session aus localStorage geladen wird (ohne staffId).

## Loesung

### Schritt 1: Session-Cache-Problem beheben

In `AuthContext.tsx` wird beim App-Start die Session aus `localStorage` geladen (Zeile ~120). Alte Sessions ohne `staffId` funktionieren nicht. Loesung: Beim Laden aus localStorage pruefen, ob `staffId` vorhanden ist -- wenn nicht, Session als ungueltig behandeln und Neu-Login erzwingen.

### Schritt 2: Pfad-Mismatch in der Datenbank korrigieren

Die DB-Eintraege fuer Lam enthalten den Pfad `manager` statt `''`. Dieser Pfad wird nie in der Sidebar abgeglichen. Zwei Optionen:

**Option A (empfohlen):** DB-Eintraege korrigieren -- `manager` durch `''` ersetzen, da `''` der tatsaechliche Sidebar-Pfad fuer "Kellner Abrechnung" ist.

**Option B:** In der Berechtigungsverwaltung (`/permissions`) sicherstellen, dass die richtigen Pfade gespeichert werden (laengerfristiger Fix).

### Schritt 3: alwaysVisibleForManager-Whitelist ueberarbeiten

Die Whitelist `['', 'summary', 'kitchen', 'register-balance']` ueberschreibt individuelle Berechtigungen. Wenn Manager **individuell** eingeschraenkt werden sollen, muss die Whitelist auf das absolute Minimum reduziert werden -- nur `''` (Kellner Abrechnung) als Pflichtseite, alles andere ueber DB-Berechtigungen steuern.

## Technische Aenderungen

### 1. `src/contexts/AuthContext.tsx` -- Session-Validierung

Beim Laden der gespeicherten Session aus localStorage pruefen, ob `staffId` vorhanden ist. Wenn nicht, die gespeicherte Session verwerfen und Neu-Login erzwingen.

### 2. `src/components/layout/AppLayout.tsx` -- Whitelist reduzieren

```text
// Vorher:
const alwaysVisibleForManager = ['', 'summary', 'kitchen', 'register-balance'];

// Nachher:
const alwaysVisibleForManager = [''];
```

Nur die Kellner-Abrechnung ist Pflicht. Alle anderen Seiten werden ueber die DB-Berechtigungen gesteuert.

### 3. Datenbank-Migration: Pfad `manager` korrigieren

SQL-Migration um den falschen Pfad `manager` in `''` umzuwandeln (betrifft alle Manager mit diesem Eintrag):

```text
UPDATE manager_nav_permissions SET nav_path = '' WHERE nav_path = 'manager';
```

Ausserdem sicherstellen, dass die Berechtigungsverwaltungsseite (`/permissions`) die korrekten Pfade speichert.

### 4. `src/types/permissions.ts` -- MANAGER_NAV_ITEMS synchronisieren

Die `MANAGER_NAV_ITEMS`-Liste (verwendet auf der /permissions-Seite) enthaelt `{ path: 'manager', label: 'Kellnerabrechnung' }`. Dieser Pfad muss auf `''` geaendert werden, damit kuenftig die richtigen Werte gespeichert werden.

```text
// Vorher:
{ path: 'manager', label: 'Kellnerabrechnung' },

// Nachher:
{ path: '', label: 'Kellnerabrechnung' },
```

## Zusammenfassung

| Aenderung | Datei | Zweck |
|-----------|-------|-------|
| Session-Validierung | AuthContext.tsx | Alte Sessions ohne staffId invalidieren |
| Whitelist reduzieren | AppLayout.tsx | Nur Kellner-Abrechnung als Pflicht |
| DB-Migration | SQL | Pfad 'manager' -> '' korrigieren |
| MANAGER_NAV_ITEMS | permissions.ts | Korrekte Pfade bei Zuweisung speichern |


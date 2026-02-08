
## Manager-Kern-Navigation immer sichtbar

### Übersicht
Neben der Kellnerabrechnung sollen Manager auch das **Dashboard**, **Küchen Trinkgeld** und **Tagesabrechnung** immer sehen - unabhängig von benutzerdefinierten Berechtigungen. Nur Statistiken, Verlauf und Bargeldbestand bleiben konfigurierbar.

### Betroffene Datei

| Datei | Änderung |
|-------|----------|
| `src/components/layout/AppLayout.tsx` | Navigation-Filterlogik erweitern |

### Änderung

**Aktuelle Logik (Zeile 80-81):**
```typescript
// Manager ALWAYS sees Kellner Abrechnung (path: '') for error corrections
if (isManager && item.path === '') return true;
```

**Neue Logik:**
```typescript
// Manager ALWAYS sees core navigation items
const alwaysVisibleForManager = ['', 'manager', 'kitchen', 'summary'];
if (isManager && alwaysVisibleForManager.includes(item.path)) return true;
```

### Navigation für Manager nach der Änderung

```text
┌─────────────────────────────────────┐
│  Navigation für Manager             │
├─────────────────────────────────────┤
│  ✓ Kellner Abrechnung (IMMER)       │
│  ✓ Manager Dashboard  (IMMER)       │ ← Kern-Funktion
│  ✓ Küchen Trinkgeld   (IMMER)       │ ← Kern-Funktion
│  ✓ Tagesabrechnung    (IMMER)       │ ← Kern-Funktion
│  ○ Statistiken                      │ ← konfigurierbar
│  ○ Verlauf                          │ ← konfigurierbar
│  ○ Bargeldbestand                   │ ← konfigurierbar
└─────────────────────────────────────┘
```

### Konfigurierbare Bereiche (über /permissions)
Nach dieser Änderung können Admins nur noch folgende Bereiche pro Manager einschränken:
- **Statistiken** (`statistics`)
- **Verlauf** (`history`)
- **Bargeldbestand** (`cash-balance`)

### Technische Details

Die Änderung erfolgt in `src/components/layout/AppLayout.tsx`, Zeile 80-81:

```typescript
// Filter nav items based on permission level and manager-specific permissions
const navItems = useMemo(() => {
  // Paths that managers ALWAYS see (core functionality)
  const alwaysVisibleForManager = ['', 'manager', 'kitchen', 'summary'];
  
  return allNavItems.filter(item => {
    // Admin sees all
    if (isAdmin) return true;
    
    // Manager ALWAYS sees core navigation items
    if (isManager && alwaysVisibleForManager.includes(item.path)) return true;
    
    // Manager with custom permissions - check if path is allowed
    if (isManager && hasCustomPermissions) {
      return managerPaths.includes(item.path);
    }
    
    // Manager without custom permissions - sees all non-admin items
    if (isManager) {
      return item.minLevel !== 'admin';
    }
    
    // Staff - only staff level items
    return item.minLevel === 'staff';
  });
}, [userLevel, isAdmin, isManager, hasCustomPermissions, managerPaths]);
```

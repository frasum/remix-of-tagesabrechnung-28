

## Zeiterfassung-Unterseiten als separate Berechtigungen

Der einzelne `zeiterfassung`-Eintrag wird durch vier granulare Einträge ersetzt, einen pro Sub-Tab.

### Änderungen

**1. `src/types/permissions.ts`**
- `NAV_PERMISSIONS`: Eintrag `'zeiterfassung'` ersetzen durch vier Einträge:
  - `'zeiterfassung'` → Wochenplan (Basis-Pfad)
  - `'zeiterfassung/zusammenfassung'` → Zusammenfassung
  - `'zeiterfassung/buchhaltung'` → Buchhaltung
  - `'zeiterfassung/perioden'` → Perioden
- `MANAGER_NAV_ITEMS`: Analog vier Einträge statt einem

**2. `src/components/layout/AppLayout.tsx`**
- Bei der Sidebar-Navigation: Wenn einer der vier `zeiterfassung/*`-Pfade erlaubt ist, den Haupt-Navigationspunkt "Zeiterfassung" anzeigen (Prüfung via `managerPaths.some(p => p.startsWith('zeiterfassung'))`)

**3. `src/pages/zeiterfassung/ZtLayout.tsx`**
- `useManagerNavPermissions` importieren und die `tabs`-Liste filtern: Nur Tabs anzeigen, für die der Manager eine Berechtigung hat
- Admins sehen alle Tabs, Manager ohne Custom-Permissions ebenfalls

### Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/types/permissions.ts` | 1 Eintrag → 4 granulare Einträge in beiden Arrays |
| `src/components/layout/AppLayout.tsx` | Sidebar-Filter: Zeiterfassung sichtbar wenn mind. ein Sub-Pfad erlaubt |
| `src/pages/zeiterfassung/ZtLayout.tsx` | Tabs nach Berechtigung filtern |



## Manager-Zugriff auf Kellnerabrechnung

### Übersicht
Manager erhalten automatisch Zugriff auf die "Kellner Abrechnung" in der Navigationsleiste, sodass sie Abrechnungsfehler von Kellnern korrigieren können. Dies ist keine konfigurierbare Berechtigung, sondern ein Standard-Feature für alle Manager.

### Aktuelle Situation
- Die Kellner Abrechnung (`path: ''`) hat `minLevel: 'staff'`
- Manager sehen sie bereits, da `minLevel: 'staff'` bedeutet "mindestens Staff-Level erforderlich"
- **Problem**: Bei Manager-spezifischen Berechtigungen (Custom Permissions) wird die Kellnerabrechnung möglicherweise nicht korrekt angezeigt

### Lösung
Die Navigation-Filterlogik in `AppLayout.tsx` sicherstellen, dass Manager **immer** die Kellnerabrechnung sehen - unabhängig von benutzerdefinierten Berechtigungen.

### Betroffene Datei

| Datei | Änderung |
|-------|----------|
| `src/components/layout/AppLayout.tsx` | Navigation-Filterlogik anpassen |

### Technische Umsetzung

**Aktuelle Logik (Zeile 75-95):**
```typescript
const navItems = useMemo(() => {
  return allNavItems.filter(item => {
    if (isAdmin) return true;
    if (isManager && hasCustomPermissions) {
      if (item.minLevel === 'staff') return true; // ✓ Bereits korrekt
      return managerPaths.includes(item.path);
    }
    if (isManager) {
      return item.minLevel !== 'admin'; // ✓ Sieht alle inkl. staff-level
    }
    return item.minLevel === 'staff';
  });
}, [...]);
```

**Analyse**: Die Logik ist bereits korrekt implementiert! Manager sehen die Kellnerabrechnung bereits:
- Manager ohne Custom Permissions: `item.minLevel !== 'admin'` → true für staff-level Items
- Manager mit Custom Permissions: `item.minLevel === 'staff'` → true für Kellnerabrechnung

### Verifikation
Die aktuelle Implementierung sollte bereits funktionieren. Falls es ein Problem gibt, liegt es möglicherweise an:
1. Fehlerhaften Berechtigungsdaten in der Datenbank
2. Einem Edge-Case in der Permission-Logik

### Empfohlene Änderung
Um absolute Sicherheit zu gewährleisten, wird die Logik expliziter gestaltet:

```typescript
const navItems = useMemo(() => {
  return allNavItems.filter(item => {
    // Admin sieht alles
    if (isAdmin) return true;
    
    // Manager sieht IMMER die Kellnerabrechnung (path: '')
    if (isManager && item.path === '') return true;
    
    // Manager mit Custom Permissions
    if (isManager && hasCustomPermissions) {
      return managerPaths.includes(item.path);
    }
    
    // Manager ohne Custom Permissions - alle Manager-Level Items
    if (isManager) {
      return item.minLevel !== 'admin';
    }
    
    // Staff - nur staff-level Items
    return item.minLevel === 'staff';
  });
}, [...]);
```

### Ablauf für Manager
```text
┌─────────────────────────────────────┐
│  Navigation für Manager             │
├─────────────────────────────────────┤
│  ✓ Kellner Abrechnung (IMMER)       │ ← Für Fehlerkorrekturen
│  ○ Manager Dashboard                │
│  ○ Küchen Trinkgeld                 │ ← Je nach Admin-Konfiguration
│  ○ Tagesabrechnung                  │
│  ○ Statistiken                      │
│  ○ Verlauf                          │
│  ○ Bargeldbestand                   │
└─────────────────────────────────────┘
```

### Sicherheitshinweis
Manager können damit alle Kellner-Abrechnungen des Tages sehen und bearbeiten. Änderungen werden über das bestehende Audit-Log protokolliert (`audit_logs` Tabelle).

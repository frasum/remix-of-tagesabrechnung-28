

## Mitarbeiterverwaltung: Tabellenansicht statt Karten

### Problem
Die aktuelle Karten-Ansicht (3 Spalten, gruppiert nach Restaurant) ist unübersichtlich. Informationen wie Rolle, Restaurant-Zuordnung und Berechtigungsstufe sind über viele Badges verteilt und schwer zu scannen.

### Vorschlag: Kompakte Tabelle

Statt Karten eine sortierbare Tabelle mit allen relevanten Infos auf einen Blick:

```text
┌──────────────┬──────────────────┬─────────────┬──────────────────┬──────────┐
│ Name         │ Rolle            │ Restaurants │ Berechtigung     │ Aktionen │
├──────────────┼──────────────────┼─────────────┼──────────────────┼──────────┤
│ Ann          │ ☑ Service        │ Spicery     │ Mitarbeiter      │ ✏️ 🗑️    │
│ Mo           │ ☑ Service        │ Spicery,YUM │ Manager          │ ✏️ 🗑️    │
│ Gerard       │ ☑ Service ☑ GL   │ Spicery     │ Manager          │ ✏️ 🗑️    │
│ Appel        │ ☑ Küche          │ YUM,Spicery │ Mitarbeiter      │ ✏️ 🗑️    │
└──────────────┴──────────────────┴─────────────┴──────────────────┴──────────┘
```

### Vorteile
- Alle Mitarbeiter in einer einzigen, sortierbaren Liste
- Rolle, Restaurants und Berechtigung sofort sichtbar ohne Badges-Überladung
- Such- und Tab-Filter (Alle/Service/Küche) bleiben bestehen
- Ranking-Badge (#4 · 9.4%) weiterhin inline neben dem Namen
- Auf Mobile: horizontales Scrollen oder responsive Karten-Fallback

### Änderungen

| Datei | Änderung |
|---|---|
| `src/pages/StaffManagement.tsx` | Gruppierung nach Restaurant entfernen, stattdessen eine flache, alphabetisch sortierte Liste aller Mitarbeiter rendern. Karten-Grid durch `<Table>` ersetzen. |
| `src/components/staff/StaffCard.tsx` | Wird nicht mehr verwendet — Logik in eine neue `StaffTableRow`-Komponente überführen, die eine `<TableRow>` rendert. |
| `src/components/staff/StaffTableRow.tsx` | Neue Komponente: eine Tabellenzeile mit Spalten für Name (+ Ranking/Warnungen), Rollen-Chips, Restaurant-Badges, Berechtigungsstufe und Aktions-Buttons. |

### Mobile-Strategie
Auf kleinen Bildschirmen (`< sm`) wird die Tabelle in einem horizontal scrollbaren Container (`overflow-x-auto`) gerendert, damit alle Spalten erreichbar bleiben.


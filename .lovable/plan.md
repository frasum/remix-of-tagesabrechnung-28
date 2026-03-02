

## Sidebar-Modernisierung (aktualisierte Gruppierung)

### Gruppierung

**Tagesgeschäft**: Mitarbeiter Abrechnung, Küchen Trinkgeld, Tagesabrechnung, Zeiterfassung, QR-Poster

**Auswertung**: Statistiken, Verlauf, Bargeldbestand

**Verwaltung** (nur Admin): Mitarbeiter, Telegram, Chat

### Visuelle Änderungen (wie zuvor geplant)

- Glassmorphism Header: `backdrop-blur-sm bg-sidebar/80`
- Gruppenlabels: `text-xs uppercase text-muted-foreground` mit Separatoren zwischen Gruppen
- Aktiver Eintrag: Linke Amber-Leiste (`border-l-3 border-primary`) + `bg-sidebar-accent/50` + Icon in `text-primary`
- Gleiche Logik für Desktop-Sidebar und Mobile-Menü

### Technische Umsetzung

**Datei: `src/components/layout/AppLayout.tsx`**

- `allNavItems` Array-Reihenfolge anpassen: QR-Poster nach Zeiterfassung
- Gruppen-Definition: Tagesgeschäft = `['', 'kitchen', 'summary', 'zeiterfassung', 'qr-poster']`, Auswertung = `['statistics', 'history', 'cash-balance']`
- Admin-Items (Mitarbeiter, Telegram, Chat) als separate Verwaltungs-Gruppe
- Gruppen mit Permission-Filter kombinieren, leere Gruppen ausblenden
- Aktiver Zustand und Glassmorphism-Styles anwenden
- Mobile-Menü dieselbe Gruppierung verwenden


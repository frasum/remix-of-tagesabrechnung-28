

## Problem

Der Küchenplan (`/kueche-plan`) verwendet `GlobalLayout`, das nur "Mitarbeiter" und "Berechtigungen" in der Sidebar zeigt. Dadurch sieht man beim Öffnen des Küchenplans die falsche Navigation ("Mitarbeiterverwaltung") ohne Hinweis auf den Küchenplan selbst.

## Lösung

Den Küchenplan als Navigationslink in `GlobalLayout.tsx` hinzufügen — in einer eigenen Gruppe "Planung" (analog zur AppLayout-Struktur).

### Änderung in `src/components/layout/GlobalLayout.tsx`

1. `ChefHat` und `CalendarDays` Icons importieren
2. Nach dem "Verwaltung"-Block eine neue Gruppe "Planung" mit dem Küchenplan-Link einfügen:
   - `/kueche-plan` → "Küchenplan" (ChefHat Icon)
3. Der Link wird mit den bestehenden `linkClasses`/`iconClasses` korrekt als aktiv hervorgehoben

Eine Datei, minimale Ergänzung (~10 Zeilen).


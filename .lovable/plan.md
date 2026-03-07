

# Tagesdetails-Tabelle verbessern

## Aktuelle Probleme
- Spaltenheader "Ø €/h Service/Küche & GL" ist sehr lang und unproportional
- Tabelle wirkt weit auseinandergezogen
- Keine visuelle Einheit zwischen "Ø / MA" und "Ø €/h"

## Vorgeschlagene Verbesserungen

### 1. Kürzerer Header mit Tooltip
Header ändern zu **"Ø €/h (alle)"** — beim Hover erscheint ein Tooltip mit "Umsatz pro Stunde · Service, Küche & GL".

### 2. Einheit direkt an den Werten
Statt "Stunden (h)" und "Umsatz (€)" im Header die Einheiten an die Werte hängen (z.B. `31,00 h` und `5.710,00 €`), Header dann nur "Stunden" und "Umsatz". Alternativ: beibehalten wie es ist — hier ist es Geschmackssache.

### 3. €/h-Werte mit Einheit und Farbe
Die Ø €/h Werte mit `€` Suffix anzeigen (z.B. `58,56 €`) und optional farblich abstufen (z.B. grün > 50 €/h, normal darunter).

## Änderung

### `src/pages/zeiterfassung/ZtProvision.tsx`
- **Header**: `Ø €/h Service/Küche & GL` → `Ø €/h (alle)` mit `<Tooltip>` der "Umsatz pro Stunde · inkl. Service, Küche & GL" anzeigt
- **Zellen**: `€` Suffix an den Ø €/h Werten ergänzen für Konsistenz

Nur eine Datei, minimale Änderung.


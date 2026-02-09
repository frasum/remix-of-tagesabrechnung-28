

# Kellner-Tabelle auf Seite 2 fuer beidseitigen Druck

## Ziel
Da der Drucker beidseitig drucken kann, soll die Kellner-Tabelle immer auf Seite 2 beginnen. Seite 1 enthaelt die Zusammenfassung, Ausgaben und Vorschuesse. So ergibt sich ein sauberes Vorder-/Rueckseiten-Layout.

## Technische Aenderung

### Datei: `src/utils/pdfExport.ts`

1. **Seiten-Loeschung entfernen** (Zeilen 280-284) -- der `while`-Loop, der alle Seiten nach Seite 1 loescht, wird entfernt.

2. **Seitenumbruch vor Kellner-Tabelle erzwingen** -- Direkt vor dem Kellner-Block (`if (data.waiterShifts.length > 0)`) wird ein `doc.addPage()` eingefuegt, damit die Kellner-Tabelle immer auf Seite 2 startet. Die `y`-Position wird auf den Seitenanfang zurueckgesetzt.

3. **Seitenzahlen im Footer** -- Analog zum Cash-Balance-PDF wird am Ende eine Schleife ueber alle Seiten eingefuegt, die "Seite X von Y" unten zentriert ausgibt.

### Seitenaufteilung

- **Seite 1 (Vorderseite):** Header, Warnungen, Zusammenfassungstabelle, Bargeld, Ausgaben, Vorschuesse
- **Seite 2 (Rueckseite):** Kellner-Tabelle (Name, Umsatz, Abgabezeit, TG Euro, TG %)


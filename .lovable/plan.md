

# Excel-Layout aufräumen

## Was wird geändert

In der Datei `src/components/daily-summary/layouts/ExcelLayout.tsx`:

1. **Entfernen**: Die "KELLNER"-Tabelle (Zeilen 194-248) - die horizontale Kellner-Übersicht mit Abzugeben, Kredit Karten, etc.
2. **Entfernen**: Der "TRINKGELD POOL"-Block (Zeilen 250-283) - Küchen-TG, Kellner-TG Pool, TG Gesamt
3. **Umordnen**: Die "Ausgaben" werden von der linken Spalte (unterhalb der Haupttabelle) nach rechts verschoben - unter die "Notizen"

## Neue Struktur der rechten Spalte

Vorher: Kellner-Tabelle, Trinkgeld Pool, Notizen
Nachher: Notizen, Ausgaben

## Technische Details

| Datei | Aktion |
|-------|--------|
| `src/components/daily-summary/layouts/ExcelLayout.tsx` | Kellner-Tabelle und Trinkgeld Pool entfernen, Ausgaben unter Notizen verschieben |

Die Kellner- und Trinkgeld-Daten sind weiterhin über andere Navigationsseiten einsehbar und gehen nicht verloren.


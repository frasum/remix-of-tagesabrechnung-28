
# Status-Spalte aus Verlauf entfernen

## Was wird gemacht
Die Spalte "Status" (die "Offene Rechnung" / "Abgeschlossen" anzeigt) wird aus der Verlaufstabelle entfernt, da sie nicht benötigt wird. Das macht die Tabelle kompakter und übersichtlicher.

## Auch betroffen: Quick Stats
Der Statistik-Kasten "Abgeschlossen" (der die Anzahl finalisierter Sessions zeigt) wird ebenfalls entfernt, da er ohne die Status-Spalte keinen Mehrwert mehr bietet.

## Technische Details

### Datei: `src/pages/History.tsx`

1. Die Variable `finalizedSessions` entfernen (wird nicht mehr gebraucht)
2. Die zweite Stat-Card ("Abgeschlossen") entfernen
3. Das Grid-Layout der Stat-Cards anpassen (nur noch 1 Karte)
4. In der Tabelle:
   - Die `<TableHead>` Zeile "Status" entfernen
   - Die `<TableCell>` mit der Status-Anzeige (CheckCircle/XCircle) entfernen
5. Nicht mehr benötigte Imports aufräumen: `CheckCircle`, `XCircle`

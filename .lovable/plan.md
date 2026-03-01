

## Plan: Layout der Zusammenfassungsseite an Buchhaltung angleichen

Die Zusammenfassungsseite hat aktuell den Titel in einer eigenen Zeile und darunter Select + Buttons nebeneinander. Die Buchhaltungsseite hat alles in einer Zeile: links Titel + Select, rechts die Buttons (`justify-between`).

### Änderung in `src/pages/zeiterfassung/ZtZusammenfassung.tsx`

Die zwei `div`-Blöcke (Zeilen 118-121 und 122-157) werden zu einem einzelnen `flex justify-between` Block zusammengeführt:

- **Links**: Titel "Zusammenfassung" + Period-Select in einer Gruppe (`flex items-center gap-3`)
- **Rechts**: PDF- und Excel-Buttons in einer Gruppe (`flex items-center gap-2`)
- SelectTrigger bekommt `h-8 text-xs` wie bei Buchhaltung

Keine funktionalen Änderungen, nur Layout-Anpassung.


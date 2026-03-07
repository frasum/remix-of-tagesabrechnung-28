

# Plan: Provisionsverteilung nach Stunden klarer darstellen

Die aktuelle Logik ist korrekt — der Schwellwert wird pro Tag/MA geprüft und die Verteilung erfolgt nach geleisteten Stunden. Das muss nur besser sichtbar werden.

## Änderungen in `ZtProvision.tsx`

1. **Summary-Karte "Abrechnungstage"** → durch **"Σ Stunden"** ersetzen, die die Gesamtstunden aller Mitarbeiter zeigt (`result.totalHours`)
2. **Neue Zeile/Info** unter den Karten oder als Subtext: kurzer Hinweis wie _"Verteilung nach geleisteten Stunden"_
3. **Provisions-Spalte in der Tabelle** bleibt — dort sieht man bereits, dass MA mit mehr Stunden mehr Provision bekommen

Nur UI-Anpassung, keine Logik- oder DB-Änderung.


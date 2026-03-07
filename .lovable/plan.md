

## Warnung bei Tagesdurchschnitt über 50 €

### Kontext
In `ExcelLayout.tsx` (Zeile 180) wird der Durchschnittsverzehr berechnet: `(pos_total - takeaway_total) / guestCount`. Wenn dieser Wert 50 € überschreitet, soll ein Bestätigungsdialog erscheinen.

### Umsetzung

**Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`**

1. State für den Warndialog hinzufügen (`showAvgWarning`, `pendingGuestCount`)
2. Die `onGuestCountChange`-Logik erweitern: Bevor der Wert übernommen wird, den Durchschnitt prüfen. Falls > 50 €, den Dialog öffnen und den Wert erst nach Bestätigung durchreichen.
3. Einen `AlertDialog` mit Warnung einbauen:
   - Titel: "Hoher Durchschnittsverzehr"
   - Text: "Der Durchschnitt pro Gast beträgt X €. Ist das korrekt?"
   - Buttons: "Abbrechen" (setzt auf vorherigen Wert zurück) / "Bestätigen" (übernimmt den Wert)

### Ablauf
```text
Gästeanzahl eingeben
  → Durchschnitt berechnen
  → > 50 € ?
     ├─ Nein → Wert normal speichern
     └─ Ja  → AlertDialog anzeigen
              ├─ Bestätigen → Wert speichern
              └─ Abbrechen  → alten Wert beibehalten
```

Keine weiteren Dateien betroffen, da die Berechnung und Eingabe vollständig in `ExcelLayout.tsx` stattfinden.


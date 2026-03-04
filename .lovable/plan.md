

## Plan: Stundenlohn-Feld in den Lohnabrechnungsdaten anzeigen

### Problem
Das Feld `hourly_rate` wird vom thaitime-Sync korrekt in die `staff`-Tabelle übernommen, aber im Mitarbeiter-Dialog unter "Lohnabrechnungsdaten" nicht angezeigt. Es fehlt sowohl die Darstellung als auch die Möglichkeit, den Wert manuell zu bearbeiten.

### Umsetzung

**Datei: `src/components/staff/StaffDialogNative.tsx`**

1. Neuen State `hourlyRate` hinzufügen und beim Initialisieren aus `staff.hourly_rate` befüllen.
2. Im Lohnabrechnungsdaten-Grid ein neues Input-Feld "Stundenlohn" einfügen (vor Steuerklasse, als erstes Feld oder nach Austritt -- passend zum Layout).
3. Beim Speichern `hourly_rate: parseFloat(hourlyRate) || undefined` an `onSave` übergeben.

Keine Datenbankänderungen nötig -- das Feld existiert bereits in der `staff`-Tabelle und im `StaffInput`-Interface.


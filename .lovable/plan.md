

## Problem

Die Gästezahl-Validierung (`handleGuestCountChange`) wird bei jedem Tastendruck (`onChange`) ausgelöst. Bei Eingabe von z.B. "2" wird sofort der Durchschnitt berechnet (4956/2 = 2478 > 50), und der Dialog erscheint, bevor der Nutzer die vollständige Zahl eingeben kann.

## Lösung

Die Validierung nur bei `onBlur` oder `Enter` ausführen, nicht bei jedem Tastendruck.

**Datei: `src/components/daily-summary/layouts/ExcelLayout.tsx`**

1. Einen lokalen State `localGuestInput` für die Texteingabe einführen
2. `onChange` aktualisiert nur den lokalen Display-Wert (keine Validierung)
3. `onBlur` (und Enter via das bestehende Input-Verhalten) löst `handleGuestCountChange` aus
4. `handleGuestCountChange` bleibt unverändert (prüft > 50 € Durchschnitt)

```text
Vorher:  onChange → handleGuestCountChange → Dialog
Nachher: onChange → localState | onBlur → handleGuestCountChange → Dialog
```


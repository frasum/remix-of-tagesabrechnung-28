

## Was "Bestehende Schichten überschreiben" tut

Diese Funktion nimmt alle **bereits existierenden** Schichten der ausgewählten Mitarbeiter in der aktuellen Periode und überschreibt deren Start-/Endzeiten mit den Standardwerten:
- **Wochentage**: 17:00 – 01:00
- **Sonn-/Feiertage**: 15:00 – 02:00

Dabei werden nur Schichten berücksichtigt, die bereits eine Start- und Endzeit haben und **keine** Abwesenheit (Urlaub, Krank etc.) eingetragen haben. Abwesenheiten und leere Schichten bleiben unberührt. Die Stunden (Gesamt, Abend, Nacht, Sonn-/Feiertagszuschläge) werden automatisch neu berechnet.

Im Gegensatz zu den anderen beiden Sektionen werden hier **keine neuen Schichten erzeugt** — es werden nur vorhandene Einträge aktualisiert.

### Änderung

In `src/components/zeiterfassung/ShiftTimeOverride.tsx` wird unter der Überschrift "Bestehende Schichten überschreiben" ein Beschreibungstext eingefügt (analog zu den Sektionen 2 und 3):

```
Überschreibt die Zeiten aller vorhandenen Schichten (mit Start-/Endzeit, ohne Abwesenheit) auf die Standardwerte. Es werden keine neuen Schichten erzeugt.
```


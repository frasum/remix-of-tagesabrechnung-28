

# Warum Brutto-Unterschiede entstehen — Analyse & Fix

## Das Problem

Die interne Brutto-Berechnung ist: `Stundenlohn × Gesamtstunden = Brutto`

Das ist korrekt — aber es gibt **drei konkrete Fehlerquellen**, die zu Abweichungen führen:

### 1. Falscher Stundenlohn (häufigste Ursache)

**Code-Logik** (Zeile 423):
```
hrRate = zt_hourly_rate > 0 ? zt_hourly_rate : staff.hourly_rate
```

Problem: Bei Ann z.B. ist `zt_hourly_rate = 0.00` im Restaurant "Spicery". Der Fallback nimmt dann `staff.hourly_rate = 14.00`. Wenn das Lohnbüro aber z.B. 14.50 € abrechnet, entsteht sofort eine Differenz über alle Stunden.

**Lösung**: Die neuen Spalten "Stundenlohn (Intern)" vs. "Stundenlohn (Lohnbüro)" in der Vergleichstabelle zeigen genau diese Abweichung. Wo der interne Stundenlohn falsch ist, muss er in den Mitarbeiter-Stammdaten korrigiert werden.

### 2. Abweichende Stundenzahl

Die Stunden kommen aus `zt_shifts.total_hours`. Wenn Schichten fehlen oder falsch erfasst sind, weicht die Summe ab. Auch hier zeigen die neuen Spalten "Stunden (Intern)" vs. "Stunden (Lohnbüro)" die Differenz.

### 3. Bezahlte Abwesenheiten fehlen

Die Query filtert mit `.is("absence_type", null)` — das heißt **alle** Abwesenheiten werden ausgeschlossen, auch bezahlte (Feiertage, bezahlter Urlaub). Das Lohnbüro rechnet diese Stunden aber zum Brutto dazu.

## Vorgeschlagene Maßnahmen

### Sofort: Stundenlohn-Abgleich sichtbar machen

Die Vergleichstabelle mit Stunden + Stundenlohn ist bereits implementiert. Wenn nach dem PDF-Upload die Lohnbüro-Daten angezeigt werden, kann man **pro Mitarbeiter** sofort sehen:
- Stimmt der Stundenlohn überein? → Falls nein: Stammdaten korrigieren
- Stimmen die Stunden überein? → Falls nein: Fehlende Schichten prüfen

### Optional: Bezahlte Abwesenheiten einrechnen

Für Mitarbeiter mit bezahltem Urlaub oder Feiertagslohn die Stunden aus `zt_shifts` auch mit `absence_type IN ('urlaub', 'feiertag')` einbeziehen, sofern sie als "bezahlt" markiert sind.

| Datei | Änderung |
|---|---|
| `src/components/zeiterfassung/BatchPayrollCalculation.tsx` | Optional: Bezahlte Abwesenheiten in Stundensumme einbeziehen |

Soll ich die bezahlten Abwesenheiten in die Brutto-Berechnung einbeziehen, oder reicht der aktuelle Stundenlohn/Stunden-Vergleich über die PDF-Extraktion?


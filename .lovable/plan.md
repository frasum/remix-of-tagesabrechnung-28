

## Analyse

Du hast recht. Aktuell wird nur **ein** Badge oben rechts in der Karte angezeigt, das die Differenz von A relativ zu B zeigt. Das ist verwirrend, weil es nicht klar zugeordnet ist.

## Loesung: Individuelle Badges pro Restaurant

Statt eines einzelnen Badges oben rechts bekommt **jedes Restaurant seinen eigenen Badge** direkt neben seinem Wert:

- **Fuehrendes Restaurant** (z.B. Spicery): Gruener Badge mit `+18.2%`
- **Zurueckliegendes Restaurant** (z.B. YUM): Roter Badge mit `-18.2%` (selbe Zahl, invertiertes Vorzeichen)
- **Gleichstand**: Grauer Badge mit `0.0%` bei beiden

Der zentrale Badge oben rechts wird entfernt. Stattdessen erscheint der Badge inline neben dem jeweiligen Betrag.

### Layout pro Karte (neu)

```text
┌─────────────────────────────────────────┐
│              Gesamtumsatz               │
│                                         │
│  ● Spicery          VS         YUM ●    │
│  30.224 € +18.2%      25.565 € -15.4%  │
│  ████████████████░░░░░░░░░░░░░          │
└─────────────────────────────────────────┘
```

### Technische Umsetzung

**Datei**: `src/components/statistics/RestaurantComparison.tsx`

1. Badge aus dem Header entfernen (Zeile 39-61)
2. Header nur noch Label zentriert anzeigen
3. Bei jedem Wert (Zeile 71-73 und 87-89) einen kleinen Badge hinzufuegen:
   - A-Badge: `rawDiff` (positiv = gruen, negativ = rot)
   - B-Badge: `-rawDiff` (invertiert, also wenn A +18% hat, bekommt B -15.4% basierend auf umgekehrter Berechnung)
4. B-Prozent korrekt berechnen: `valA !== 0 ? ((valB - valA) / Math.abs(valA)) * 100 : 0` -- das ist **nicht** einfach `-rawDiff`, da die Basis anders ist


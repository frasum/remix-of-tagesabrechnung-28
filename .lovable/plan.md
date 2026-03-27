
## Warum das passiert

Das ist kein Stunden- oder Restaurant-Bug, sondern die aktuelle Suchlogik:

- In allen betroffenen Ansichten wird dieselbe Funktion `filterEmployeesBySearch(...)` verwendet.
- Diese sucht per `includes(...)` in `nickname`, `name`, `first_name` und `last_name`.
- Deshalb trifft `mo` nicht nur auf den Nickname `MO`, sondern auch auf Namen wie:
  - `Amonwan`
  - `Duangkamon`

Zusätzlich erscheinen `MO`-Zeilen mehrfach, weil derselbe Mitarbeiter in mehreren Restaurant-/Abteilungs-Kombinationen geführt wird. Das ist bei der restaurantübergreifenden Suche grundsätzlich korrekt.

## Sinnvoller Fix

Die Suche sollte für kurze Eingaben strenger werden:

1. **Bei 1–2 Zeichen**
   - nur **exakter Nickname-Treffer** oder
   - **Beginn eines Namens/Wortteils** matchen

2. **Ab 3 Zeichen**
   - die bisherige großzügige Teilstring-Suche beibehalten

Damit würde:
- `Mo` noch `MO`, `Monika`, `Mohammad` finden
- aber **nicht mehr** `Amonwan` oder `Duangkamon`

## Umsetzung

**Datei:** `src/components/zeiterfassung/EmployeeSearchFilter.tsx`

Dort die zentrale Funktion `filterEmployeesBySearch(...)` anpassen, damit:
- kurze Suchbegriffe nicht mehr mitten im Namen matchen
- stattdessen Wortanfänge/Nickname priorisiert werden

## Technisches Detail

Aktuell ist die Logik sinngemäß:

```ts
displayName.includes(term) ||
first_name?.includes(term) ||
last_name?.includes(term) ||
name?.includes(term)
```

Geplant ist eine zweistufige Logik:

```text
1–2 Zeichen:
- exact nickname match
- startsWith auf Namensbestandteile

ab 3 Zeichen:
- includes wie bisher
```

## Betroffene Wirkung

Ein zentraler Fix reicht aus und wirkt automatisch in:
- Wochenplan
- Zusammenfassung
- Buchhaltung
- Lohnbüro-Portal

Keine DB-Änderung nötig.

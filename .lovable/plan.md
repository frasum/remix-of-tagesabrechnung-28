

# Provisionsdaten in den KI-Chat-Kontext einbinden

## Problem
Der System-Prompt erwähnt "Provisionsberechnung", aber die Edge Function lädt keinerlei Provisionsdaten. Die KI kann daher keine Fragen zu Provisionen beantworten.

## Lösung
In `supabase/functions/restaurant-chat/index.ts` wird die Provisionsberechnung serverseitig repliziert und als voraggregierte Daten in den Kontext eingefügt.

## Daten die zusätzlich geladen werden

1. **Settings**: `commission_min_revenue` und `commission_pct` pro Restaurant
2. **Staff-Rollen**: Bereits geladen — GL-Rollen (`gl`, `kitchen_gl`) werden ausgeschlossen
3. **Staff-Restaurants**: `zt_department = 'Service'` für die Stunden-Zuordnung
4. **zt_shifts**: Service-Schichten für die letzten 90 Tage (Stunden pro Mitarbeiter/Tag)

## Berechnungslogik (identisch zum Frontend)

Für jeden Monat und jedes Restaurant:
1. Waiter-Shifts nach Tag gruppieren, GL-Rollen ausschließen
2. Sekundäre/zusätzliche Kellner als separate Service-MA zählen
3. Pro Tag: `Umsatz / Anzahl Service-MA` berechnen → qualifiziert wenn ≥ Schwellenwert
4. Pool = Summe der qualifizierten Tage: `(Umsatz - Schwellenwert × MA-Anzahl) × Prozentsatz`
5. Verteilung proportional zu den Arbeitsstunden (zt_shifts bevorzugt, waiter_shifts als Fallback)

## Neuer Kontext-Abschnitt

```text
=== MONATLICHE PROVISIONSBERECHNUNG (voraggregiert) ===
Monat | Restaurant | Schwellenwert | Prozent | Qual. Tage | Gesamt-Tage | Pool | Ges. Stunden | €/Stunde
2026-02 | Spicery | 1.200€ | 5% | 18 | 28 | 1.542,30€ | 320h | 4,82€

=== PROVISIONS-VERTEILUNG PRO MITARBEITER (voraggregiert) ===
Monat | Restaurant | Mitarbeiter | Stunden | Provision
2026-02 | Spicery | Max | 120h | 578,36€
```

## Prompt-Ergänzung

Neue Regel im System-Prompt:
```
- Die MONATLICHE PROVISIONSBERECHNUNG enthält voraggregierte Provisionsdaten. Verwende diese für alle Provisionsfragen. Provisionen basieren auf einem Schwellenwert-System: nur Tage, an denen der Durchschnittsumsatz pro Service-Mitarbeiter den Schwellenwert erreicht, tragen zum Provisions-Pool bei. Der Pool wird proportional zu den Arbeitsstunden verteilt.
```

## Technische Umsetzung

**Eine Datei**: `supabase/functions/restaurant-chat/index.ts`

- Zusätzliche Queries (parallel zu bestehenden): `settings` (commission keys), `staff_restaurants` (Service dept), `zt_shifts` (90 Tage)
- Provisionsberechnung als neue Funktion nach dem bestehenden Aggregationsblock
- Zwei neue Kontext-Abschnitte vor den Rohdaten
- Eine neue Regel im System-Prompt

Keine DB-Änderungen, keine Frontend-Änderungen.


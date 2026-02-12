
# Trinkgeld-Ranking ein-/ausschalten pro Restaurant

## Uebersicht

Ein neuer Toggle auf der Mitarbeiterverwaltungs-Seite ermoeglicht es, das "Trinkgeld Ranking" im Kellner-Selfservice (WaiterMobile) pro Restaurant ein- oder auszuschalten.

## Umsetzung

### 1. Datenbank: Setting speichern

Die bestehende `settings`-Tabelle wird genutzt. Ein neuer Eintrag mit `key = 'show_tip_ranking'` und `value = { enabled: true/false }` pro `restaurant_id` speichert die Einstellung. Kein Schema-Update noetig.

### 2. Neuer Hook: `useShowTipRanking`

Liest und schreibt das Setting `show_tip_ranking` aus der `settings`-Tabelle (gleiche Logik wie `usePettyCash`). Standardwert: `true` (Ranking ist standardmaessig sichtbar).

### 3. UI: Toggle auf der Mitarbeiterverwaltung

Unterhalb der Suchleiste/Filter auf `src/pages/StaffManagement.tsx` wird eine kompakte Zeile mit einem Switch eingefuegt:

```
[Toggle] Trinkgeld Ranking fuer Kellner anzeigen
```

Der Toggle nutzt den neuen Hook und ist an das aktuell gewaehlte Restaurant gebunden.

### 4. WaiterMobile: Ranking bedingt anzeigen

In `src/pages/WaiterMobile.tsx` wird der Hook ebenfalls verwendet. Wenn `enabled = false`, wird die `<TipRanking />`-Komponente nicht gerendert und der Ranking-Datenabruf uebersprungen.

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/hooks/useSettings.ts` | Neuen `useShowTipRanking(restaurantId)` Hook hinzufuegen |
| `src/pages/StaffManagement.tsx` | Switch-Toggle einfuegen |
| `src/pages/WaiterMobile.tsx` | Ranking bedingt rendern |

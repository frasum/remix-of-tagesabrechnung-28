

# Tooltip für Service-MA in der Tagesaufschlüsselung

## Änderung

Die `DayBreakdown`-Datenstruktur wird um eine Liste der Mitarbeiternamen erweitert. In der Tagesdetails-Tabelle wird die Service-MA-Zahl mit einem Tooltip versehen, der die Namen aller an diesem Tag eingesetzten Servicekräfte auflistet.

## Technische Umsetzung (`ZtProvision.tsx`)

1. **DayBreakdown-Typ erweitern**: Neues Feld `staffNames: string[]` hinzufügen
2. **dailyBreakdown-Memo anpassen**: Die `staffSet` enthält bereits die Keys — zusätzlich eine `nameSet` mit lesbaren Namen (ohne Prefixe wie `second:` / `add:`) pflegen
3. **Tooltip rendern**: In der TableCell für Service-MA einen `Tooltip` aus `@/components/ui/tooltip` verwenden, der die Namensliste anzeigt

```text
┌──────────┬────────────┐
│ Service-MA │    5       │  ← Hover zeigt:
│            │            │     • Jasmin
│            │            │     • Europe
│            │            │     • Andi
│            │            │     • Tu
│            │            │     • Minh
└──────────┴────────────┘
```

Nur eine Datei betroffen: `src/pages/zeiterfassung/ZtProvision.tsx`




## Fix: Doppelte Besonderheiten-Einträge

### Ursache
`BuchhaltungRow` baut den Besonderheiten-Text zusammen aus:
1. Auto-generiertem Vorschuss-Text (`advanceText`)
2. Auto-generiertem Urlaubs-Text (`vacText`)
3. Gespeichertem `note.besonderheiten` aus der DB

Beim Speichern (onBlur) wird der **gesamte zusammengesetzte Text** in `besonderheiten` geschrieben. Beim nächsten Laden wird der auto-generierte Text erneut vorangestellt → Duplikate.

### Lösung

**`src/pages/zeiterfassung/buchhaltung/BuchhaltungRow.tsx`**

1. Den **angezeigten** Text weiterhin zusammensetzen aus `advanceText + vacText + note.besonderheiten`
2. Beim **Speichern** (onBlur) den auto-generierten Prefix abziehen — nur den manuell eingegebenen Teil speichern:
   - Den aktuellen `advanceText` und `vacText` vom gespeicherten Wert abziehen
   - Konkret: Wenn der gespeicherte Wert mit dem auto-generierten Prefix beginnt, diesen entfernen

```text
Anzeige:  "Vorschuss 18.03.: 900,00 € | U: 26.02.–25.03. (28T) | 50 Euro Sachbezug"
                ↑ auto                      ↑ auto                   ↑ manuell
Gespeichert wird nur: "50 Euro Sachbezug"
```

Implementierung:
- `autoPrefix` berechnen als `[advanceText, vacText].filter(Boolean).join(" | ")`
- Beim onBlur: wenn `value` mit `autoPrefix` beginnt, den Prefix + Separator entfernen, Rest speichern
- Bestehende DB-Werte einmalig bereinigen: beim Rendern prüfen ob `note.besonderheiten` mit bekanntem auto-Text beginnt und diesen Teil ignorieren

1 Datei, keine DB-Änderung.


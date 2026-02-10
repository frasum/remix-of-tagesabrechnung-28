

# Labels und Ausblenden in der Kellnerabrechnung

## Ziel
Die Kellnerabrechnung (`WaiterCashUp`) bekommt die gleiche dynamische Label- und Ausblend-Funktionalitaet wie die Tagesabrechnung. Hardcodierte Labels werden durch `getLabel()` ersetzt, und ausgeblendete Felder werden im Formular und in der Tabelle nicht angezeigt.

## Aenderungen in `src/pages/WaiterCashUp.tsx`

### 1. `isFieldHidden` importieren
- Aus dem bestehenden `useLabels`-Hook wird zusaetzlich `isFieldHidden` verwendet (ist bereits implementiert)

### 2. Hardcodierte Labels ersetzen

| Stelle | Aktuell | Wird zu |
|---|---|---|
| Zeile 331: Kartenzahlung-Label | `"Kartenzahlung (Kredit Karten)"` | `getLabel('card_total_gl')` |
| Zeile 512: Tabellenkopf Kredit Karten | `"Kredit Karten"` | `getLabel('card_total_gl')` |
| Zeile 515: Tabellenkopf Abgegeben | `"Abgegeben"` | `getLabel('cash_handed_in')` |
| Zeile 353: Vorschau-Formeltext | Hardcodierte Begriffe | Dynamische Labels |

### 3. Felder bedingt ausblenden

Folgende Felder im **Eingabeformular** werden mit `isFieldHidden()` umschlossen:
- `hilf_mahl` - Eingabefeld wird ausgeblendet, Wert bleibt 0
- `open_invoices` - Eingabefeld wird ausgeblendet, Wert bleibt 0
- `card_total_gl` (fuer `card_total`) - Eingabefeld wird ausgeblendet, Wert bleibt 0

Folgende **Tabellenspalten** in der Uebersichtstabelle werden bedingt ausgeblendet:
- `hilf_mahl` - Spalte und Zelle
- `open_invoices` - Spalte und Zelle
- `card_total_gl` - Spalte und Zelle

### 4. Vorschau-Berechnung anpassen
Die Formel-Beschreibung im grauen Vorschau-Kasten wird dynamisch zusammengebaut:
- Nur sichtbare Felder werden in der Formel-Beschreibung erwaehnt
- Die eigentliche Berechnung bleibt unveraendert (hidden Felder haben Wert 0)

### 5. Logik
- Wenn ein Feld hidden ist, wird das Eingabefeld nicht gerendert und der State-Wert bleibt 0
- Die Berechnungen (`calculateExpected`, `calculateContribution`) funktionieren weiterhin korrekt
- Beim Bearbeiten eines bestehenden Eintrags: hidden Felder werden nicht angezeigt, aber vorhandene Werte bleiben in der Datenbank erhalten

## Betroffene Datei

| Datei | Aenderung |
|---|---|
| `src/pages/WaiterCashUp.tsx` | `isFieldHidden` nutzen, hardcodierte Labels ersetzen, bedingte Anzeige |


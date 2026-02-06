
# Plan: Trennung von Kellner-Umsatz und abzugebendem Betrag

## Problem-Analyse

Die aktuelle App berechnet das erwartete Bargeld basierend auf dem **POS-Umsatz** des Kellners. In der Gastronomie können jedoch Tische zwischen Kellnern transferiert werden:

| Situation | Kellner A | Kellner B |
|-----------|-----------|-----------|
| Umsatz gemacht | €500 (POS) | €0 (POS) |
| Tisch transferiert | → | ← |
| Abkassiert | €0 | €500 |
| **Erwartet (aktuell)** | €500 ❌ | €0 ❌ |
| **Erwartet (korrekt)** | €0 ✓ | €500 ✓ |

---

## Lösung

### Neues Feld: "Kassiert" (kassiert_brutto)

Ein zusätzliches Eingabefeld, das den **tatsächlich kassierten Bruttobetrag** erfasst - unabhängig davon, wer den POS-Umsatz gemacht hat.

### Formel-Anpassung

```text
BISHERIG:
Erwartet = POS Umsatz + HilfMahl - Offene Rg. - Karten

NEU:
Erwartet = Kassiert Brutto + HilfMahl - Offene Rg. - Karten

(POS Umsatz bleibt für Statistiken und Küchen-Trinkgeld erhalten)
```

---

## Umsetzungs-Schritte

### 1. Datenbank-Erweiterung
Neue Spalte in `waiter_shifts`:
- `kassiert_brutto` (NUMERIC, DEFAULT 0) - Brutto-Betrag, den der Kellner kassiert hat

### 2. UI-Anpassungen (Kellner-Abrechnung)

**Eingabeformular erweitern:**
| Feld | Beschreibung |
|------|--------------|
| POS Umsatz | Umsatz laut Kasse (für Statistiken/Küchen-TG) |
| **Kassiert Brutto** | Was der Kellner tatsächlich kassiert hat |
| Kartenzahlung | Kartenzahlungen |
| HilfMahl | Personalessen |
| Offene Rechnungen | Unbezahlte Rechnungen |
| Bargeld abgegeben | Tatsächlich abgegebenes Bargeld |

**Neue Berechnungslogik:**
```text
Erwartet = Kassiert Brutto + HilfMahl - Offene Rg. - Karten
Abweichung = Bargeld abgegeben - Erwartet
```

### 3. Tabellen-Übersicht anpassen

| Name | POS | Kassiert | Karte | HilfM | Offen | Erwartet | Abgegeben | Abweich. | K.TG | W.TG |
|------|-----|----------|-------|-------|-------|----------|-----------|----------|------|------|

### 4. Küchen-Trinkgeld Logik
Das Küchen-Trinkgeld bleibt bei **2% vom POS-Umsatz**, da dieser den tatsächlichen Verkauf widerspiegelt.

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| Datenbank-Migration | Neue Spalte `kassiert_brutto` |
| `src/types/database.ts` | WaiterShift-Interface erweitern |
| `src/pages/WaiterCashUp.tsx` | Neues Eingabefeld + Formel-Anpassung |
| `src/hooks/useSession.ts` | Hook-Typen anpassen |
| `src/pages/DailySummary.tsx` | Aggregation anpassen |
| `src/utils/pdfExport.ts` | PDF mit neuem Feld |

---

## Beispiel nach der Änderung

**Szenario:** Tisch-Transfer von Frank zu Max

| Kellner | POS Umsatz | Kassiert | Karten | Erwartet | Abgegeben | Abweichung |
|---------|------------|----------|--------|----------|-----------|------------|
| Frank | €500 | €0 | €0 | €0 | €0 | ±0 ✓ |
| Max | €0 | €500 | €100 | €400 | €400 | ±0 ✓ |

**Küchen-TG:** Frank = €10 (2% von €500), Max = €0

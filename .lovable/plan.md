

## Plan: Zwei-Spalten Layout für Tagesabrechnung

### Ziel
Die Eingabefelder und Übersichten in einem übersichtlicheren Zwei-Spalten Layout anordnen: **Links Eingabe**, **Rechts Übersicht/Zusammenfassung**.

---

## Neues Layout

```text
+------------------------------------------+------------------------------------------+
|              LINKE SPALTE                |             RECHTE SPALTE                |
|            (DATENEINGABE)                |        (ZUSAMMENFASSUNG & STATUS)        |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
|  +------------------------------------+  |  +------------------------------------+  |
|  | Stat-Cards (BARGELD, Umsatz, etc.) |  |  | Stat-Cards werden OBEN angezeigt   |  |
|  | - Bleiben oben ueber volle Breite  |  |  | (volle Breite, nicht in Spalten)   |  |
|  +------------------------------------+  |  +------------------------------------+  |
|                                          |                                          |
|  +------------------------------------+  |  +------------------------------------+  |
|  |           NOTIZEN                  |  |  |      KASSENSTAND (wenn noetig)     |  |
|  |  [Textarea fuer Notizen]           |  |  |  Anfangsbestand: 1.000 EUR         |  |
|  +------------------------------------+  |  |  Bargeld heute:    xxx EUR         |  |
|                                          |  |  Transfer:         +xx EUR         |  |
|  +------------------------------------+  |  |  --------------------------------   |  |
|  |         POS & TERMINAL             |  |  |  Kassenstand:    x.xxx EUR         |  |
|  |  Kellner Abzugebender Betrag       |  |  +------------------------------------+  |
|  |  Vectron Gesamtumsatz              |  |                                          |
|  |  Terminal 1 / Terminal 2           |  |  +------------------------------------+  |
|  |  Kreditkartenumsatz GL             |  |  |      EINNAHMEN UEBERSICHT          |  |
|  +------------------------------------+  |  |  Tagesumsatz         x.xxx EUR     |  |
|                                          |  |  Gutschein Verkauf     xxx EUR     |  |
|  +------------------------------------+  |  |  Sonstige Einnahmen    xxx EUR     |  |
|  |           TAKE AWAY                |  |  |  Hilf Mahl             xxx EUR     |  |
|  |  Takeaway GL                       |  |  |  --------------------------------   |  |
|  |  OrderSmart                        |  |  |  Summe Einnahmen   x.xxx EUR       |  |
|  |  Wolt                              |  |  +------------------------------------+  |
|  |  Take-Away Gesamt (berechnet)      |  |                                          |
|  +------------------------------------+  |  +------------------------------------+  |
|                                          |  |       ABZUEGE UEBERSICHT           |  |
|  +------------------------------------+  |  |  Terminal 1           xxx EUR      |  |
|  |      GUTSCHEINE & ABZUEGE          |  |  |  Terminal 2           xxx EUR      |  |
|  |  Gutschein Verkauf                 |  |  |  Gutschein Eingeloest xxx EUR      |  |
|  |  Gutschein Eingeloest              |  |  |  FineDine             xxx EUR      |  |
|  |  FineDine Gutscheine               |  |  |  Vorschuss            xxx EUR      |  |
|  +------------------------------------+  |  |  ...                                |  |
|                                          |  |  --------------------------------   |  |
|  +------------------------------------+  |  |  Summe Abzuege      x.xxx EUR      |  |
|  |           SONSTIGES                |  |  +------------------------------------+  |
|  |  Vorschuss                         |  |                                          |
|  |  Einladung                         |  |  +------------------------------------+  |
|  |  Sonstige Einnahmen                |  |  |      TRINKGELD UEBERSICHT          |  |
|  +------------------------------------+  |  |  Kuechen-Trinkgeld    xxx EUR      |  |
|                                          |  |  Kellner-Trinkgeld    xxx EUR      |  |
|  +------------------------------------+  |  |  Pro Kellner           xx EUR      |  |
|  |           AUSGABEN                 |  |  +------------------------------------+  |
|  |  [Beschreibung] [Betrag] [+]       |  |                                          |
|  |  Ausgabe 1         50,00 EUR [x]   |  |  +------------------------------------+  |
|  |  Ausgabe 2         30,00 EUR [x]   |  |  |    KELLNER-ABRECHNUNGEN            |  |
|  |  --------------------------------  |  |  |  Name | Status | Eingereicht       |  |
|  |  Summe Ausgaben:   80,00 EUR       |  |  |  Max  | OK     | Heute, 21:30      |  |
|  +------------------------------------+  |  |  Lisa | OK     | Heute, 21:45      |  |
|                                          |  +------------------------------------+  |
+------------------------------------------+------------------------------------------+
```

---

## Technische Umsetzung

### Aenderungen in DailySummary.tsx

**1. Haupt-Container Struktur aendern:**

Aktuell:
```tsx
<div className="space-y-6">
  {/* Warning Cards */}
  {/* Main Stats - 4 Spalten */}
  {/* Kassenstand Card */}
  {/* Input Section - 6 Cards Grid */}
  {/* Kellner-Abrechnungen */}
  {/* Detailed Breakdown - 2 Spalten */}
</div>
```

Neu:
```tsx
<div className="space-y-6">
  {/* Warning Cards - volle Breite */}
  
  {/* Main Stats - volle Breite, 4 Spalten */}
  
  {/* Zwei-Spalten Layout */}
  <div className="grid lg:grid-cols-2 gap-6">
    {/* LINKE SPALTE - Eingabe */}
    <div className="space-y-6">
      <Card>Notizen</Card>
      <Card>POS & Terminal</Card>
      <Card>Take Away</Card>
      <Card>Gutscheine & Abzuege</Card>
      <Card>Sonstiges</Card>
      <Card>Ausgaben</Card>
    </div>
    
    {/* RECHTE SPALTE - Uebersicht */}
    <div className="space-y-6">
      <Card>Kassenstand (wenn noetig)</Card>
      <Card>Einnahmen Uebersicht</Card>
      <Card>Abzuege Uebersicht</Card>
      <Card>Take Away Details</Card>
      <Card>Trinkgeld Uebersicht</Card>
      <Card>Kellner-Abrechnungen</Card>
    </div>
  </div>
</div>
```

**2. Responsive Verhalten:**
- Auf Desktop (lg:): Zwei Spalten nebeneinander
- Auf Tablet/Mobile: Eine Spalte, Eingabe oben, Uebersicht unten
- Die Spalten scrollen unabhaengig voneinander

**3. Optionale Verbesserung - Sticky Sidebar:**
```tsx
{/* Rechte Spalte sticky beim Scrollen */}
<div className="space-y-6 lg:sticky lg:top-4 lg:self-start">
```
Dies haelt die Zusammenfassung sichtbar, waehrend man durch die Eingabefelder scrollt.

---

## Vorteile dieses Layouts

| Aspekt | Verbesserung |
|--------|--------------|
| Uebersichtlichkeit | Eingabe links, Ergebnis rechts - klare Trennung |
| Effizienz | Aenderungen sind sofort rechts sichtbar |
| Weniger Scrollen | Wichtige Zahlen immer im Blick (sticky) |
| Logischer Aufbau | Arbeitsfluss von links nach rechts |
| Responsive | Auf Mobile weiterhin funktional |

---

## Dateien die geaendert werden

| Datei | Aenderung |
|-------|-----------|
| `src/pages/DailySummary.tsx` | Layout-Struktur auf Zwei-Spalten umstellen |

---

## Implementierungsschritte

1. Warning Cards und Stat-Cards bleiben oben (volle Breite)
2. Neuer Container `grid lg:grid-cols-2 gap-6` erstellen
3. Linke Spalte: Notizen, POS & Terminal, Take Away, Gutscheine, Sonstiges, Ausgaben
4. Rechte Spalte: Kassenstand, Einnahmen, Abzuege, Take Away Details, Trinkgeld, Kellner-Status
5. Optional: `lg:sticky lg:top-4` fuer rechte Spalte


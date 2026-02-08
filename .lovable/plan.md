

# Plan: Layout-Umschalter mit vier Ansichten

## Ziel

Ein Icon-basierter Layout-Umschalter am oberen Rand der Tagesabrechnung, der zwischen vier verschiedenen Ansichten wechselt:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Tagesabrechnung                                  [⎕] [≡] [⊞] [▤]  🗓️  📄 │
│  Komplette Übersicht für Samstag, 8. Februar 2026                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Die vier Layout-Optionen

| Icon | Name | Beschreibung |
|------|------|--------------|
| `LayoutList` | **Horizontal** | Alle Karten untereinander in voller Breite |
| `LayoutGrid` | **Sektionen** | Eingaben und Ergebnisse in farblich abgegrenzten Bereichen |
| `Columns2` | **Zwei-Spalten** | Aktuelles Layout (Eingaben links, Ergebnisse rechts) |
| `Table` | **Tabelle** | Kompakte Tabellenansicht mit weniger Karten |

---

## Ansicht 1: Horizontal gestapelt

Alle Karten in einer Spalte, volle Breite:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  StatCards (4er Grid)                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Notizen                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│  POS & Terminal                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Einnahmen                        │  Abzüge                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Take Away                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Gutscheine & Abzüge              │  Sonstiges                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Trinkgeld                        │  Kellner-Status                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Ausgaben                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

- Einfaches Durchscrollen
- Zusammenfassungs-Karten neben den Eingaben wo sinnvoll
- Weniger visuelle Komplexität

---

## Ansicht 2: Gruppierte Sektionen

Farblich abgegrenzte Bereiche mit Überschriften:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓ EINGABEN ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│ │ POS & Term  │ │ Take Away   │ │ Gutscheine  │ │ Sonstiges + Notizen │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓ ÜBERSICHT ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────────────┐│
│ │ Einnahmen        │ │ Abzüge           │ │ Trinkgeld                  ││
│ └──────────────────┘ └──────────────────┘ └────────────────────────────┘│
├─────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓ STATUS ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ┌──────────────────────────────┐ ┌──────────────────────────────────────┐│
│ │ Kellner-Status               │ │ Ausgaben                             ││
│ └──────────────────────────────┘ └──────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

- Klare visuelle Trennung zwischen Eingabe- und Übersichtsbereichen
- Grauer/eingefärbter Hintergrund für die Gruppenbereiche
- Schnelles Erfassen der Struktur

---

## Ansicht 3: Zwei-Spalten (aktuell)

Das bestehende Layout bleibt als Option erhalten:

```text
┌──────────────────────────────┐  ┌──────────────────────────────┐
│  Notizen                     │  │  Kassenstand                 │
├──────────────────────────────┤  ├──────────────────────────────┤
│  POS & Terminal              │  │  Einnahmen                   │
├──────────────────────────────┤  ├──────────────────────────────┤
│  Take Away                   │  │  Abzüge                      │
├──────────────────────────────┤  ├──────────────────────────────┤
│  Gutscheine & Abzüge         │  │  Trinkgeld                   │
├──────────────────────────────┤  ├──────────────────────────────┤
│  Sonstiges                   │  │  Kellner-Status              │
├──────────────────────────────┤  │                              │
│  Ausgaben                    │  │                              │
└──────────────────────────────┘  └──────────────────────────────┘
```

- Eingaben links, Ergebnisse rechts (sticky)
- Aktuelle Funktionalität

---

## Ansicht 4: Kompakte Tabelle

Weniger Karten, stattdessen eine Excel-ähnliche Übersicht:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  StatCards (4er Grid)                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  TAGESEINGABEN                                                          │
│  ┌──────────────────────┬──────────────────────┬──────────────────────┐ │
│  │ Vectron Umsatz       │ 7.168,70 €           │  [__________]        │ │
│  │ Terminal 1           │ 6.472,13 €           │  [__________]        │ │
│  │ Terminal 2           │ 0,00 €               │  [__________]        │ │
│  │ Takeaway GL          │ 0,00 €               │  [__________]        │ │
│  │ OrderSmart           │ 0,00 €               │  [__________]        │ │
│  │ Wolt                 │ 0,00 €               │  [__________]        │ │
│  │ Gutschein Verkauf    │ 0,00 €               │  [__________]        │ │
│  │ ...                  │ ...                  │  ...                 │ │
│  └──────────────────────┴──────────────────────┴──────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│  Einnahmen              │  Abzüge              │  Trinkgeld            │
│  7.168,70 €             │  6.902,82 €          │  586,23 €             │
└─────────────────────────────────────────────────────────────────────────┘
```

- Alle Eingaben in einer Tabelle gruppiert
- Kompakter, weniger Scrolling
- Übersichtliche Zusammenfassungen unten

---

## Technische Umsetzung

### UI-Komponente: Layout-Umschalter

```tsx
// Icons für die vier Layouts
import { LayoutList, LayoutGrid, Columns2, Table } from 'lucide-react';

type LayoutMode = 'horizontal' | 'sections' | 'columns' | 'table';

// Toggle Group mit Icons
<ToggleGroup type="single" value={layoutMode} onValueChange={setLayoutMode}>
  <ToggleGroupItem value="horizontal" title="Horizontal gestapelt">
    <LayoutList className="w-4 h-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="sections" title="Gruppierte Sektionen">
    <LayoutGrid className="w-4 h-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="columns" title="Zwei-Spalten">
    <Columns2 className="w-4 h-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="table" title="Kompakte Tabelle">
    <Table className="w-4 h-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

### State-Management

- Neuer State: `layoutMode` mit Typ `'horizontal' | 'sections' | 'columns' | 'table'`
- Default: `'columns'` (aktuelles Layout)
- Optional: Layout-Präferenz in localStorage speichern

### Dateiänderungen

| Datei | Änderung |
|-------|----------|
| `src/pages/DailySummary.tsx` | Layout-Umschalter hinzufügen, vier Layout-Varianten implementieren |

---

## Erwartetes Ergebnis

- **Icon-Leiste** im Header neben dem Datum und PDF-Button
- **Vier Layout-Optionen** per Klick wechselbar
- **Tooltips** erklären jedes Layout beim Hover
- **Gespeicherte Präferenz** (optional) für wiederkehrende Nutzung
- Jedes Layout zeigt dieselben Daten, nur anders angeordnet


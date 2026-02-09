
# Excel-Layout visuell aufwerten

## Ziel
Die bestehende Struktur beibehalten, aber durch gezielte Farbakzente, subtile Hintergruende und klarere visuelle Trennung der Sektionen ein moderneres, uebersichtlicheres Erscheinungsbild schaffen.

## Aenderungen in `src/components/daily-summary/layouts/ExcelLayout.tsx`

### 1. Sektions-Header aufwerten
- Jede Sektion (Umsatz, Kredit Karten, Take Away, Gutscheine) bekommt einen **farbigen linken Rand** (left border) als visuellen Akzent
- Leicht staerkerer Hintergrund fuer die Section-Header (`bg-muted/50` statt `bg-muted/30`)
- Unterschiedliche Akzentfarben pro Sektion:
  - **Umsatz**: Primary-Blau
  - **Kredit Karten**: Amber/Orange
  - **Take Away**: Emerald/Gruen
  - **Gutscheine & Sonstiges**: Violet/Lila

### 2. Eingabefelder besser hervorheben
- Input-Rows bekommen einen subtilen Hover-Effekt (`hover:bg-muted/20`)
- Readonly-Zeilen bleiben visuell zurueckhaltender, Summen-Zeilen (`bold`) bekommen einen leichten Hintergrund (`bg-muted/20`)

### 3. BARGELD-Bereich staerker betonen
- Groesserer Radius und leichter Schatten fuer den BARGELD-Bereich
- Gradient-Hintergrund statt flachem `bg-primary/10`

### 4. Gesamter Container
- Leichter Schatten (`shadow-sm`) auf dem aeusseren Container fuer mehr Tiefe
- Runde Ecken beibehalten

## Technische Details

Alle Aenderungen erfolgen ausschliesslich in einer Datei:
- **`src/components/daily-summary/layouts/ExcelLayout.tsx`**

Keine neuen Abhaengigkeiten noetig -- nur Tailwind-Klassen werden angepasst.

### Vorher/Nachher (Sektions-Header)
```text
Vorher:  bg-muted/30 px-3 py-1.5 border-b
Nachher: bg-muted/50 px-3 py-2 border-b border-l-4 border-l-primary
```

### Vorher/Nachher (Summen-Zeilen)
```text
Vorher:  border-b last:border-b-0
Nachher: border-b last:border-b-0 bg-muted/20
```

### Vorher/Nachher (BARGELD)
```text
Vorher:  bg-primary/10 border-y-2 border-primary/30
Nachher: bg-gradient-to-r from-primary/15 to-primary/5 border-y-2 border-primary/40 shadow-sm
```

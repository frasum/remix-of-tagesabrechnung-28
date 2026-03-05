

## Plan: SFN-Modus Toggle mit Beschreibungstexten

### Änderungen

#### 1. Neuer Hook: `src/hooks/useSfnMode.ts`
- `localStorage`-basierter State: `"simple"` (default) oder `"extended"`
- Exportiert `{ sfnMode, setSfnMode }`

#### 2. UI: Toggle mit Beschreibung im `ZtLayout.tsx`
- Unterhalb der Tab-Navigation ein kompaktes Panel mit:
  - **Switch**-Komponente: "Einfach" / "Erweitert (§3b)"
  - **Beschreibungstext** der sich je nach Modus ändert:

**Einfach (aktiv):**
> Sonntage und Feiertage werden gleich behandelt (50 % Zuschlag). Nachtzuschläge (25 % ab 20:00, 40 % von 00:00–04:00) werden bei Überschneidung mit So/Fei-Stunden nicht zusätzlich berechnet.

**Erweitert §3b (aktiv):**
> Zuschläge nach §3b EStG: Sonntag 50 %, Feiertag 125 % (besondere Feiertage 150 %). Nachtzuschläge werden additiv berechnet — sie stapeln sich mit Sonntags- und Feiertagszuschlägen.

- Styling: Kleine Schrift (`text-xs text-muted-foreground`), dezent unter dem Toggle, maximal 2 Zeilen.
- Der Toggle ist nur für Admins sichtbar (oder immer sichtbar, je nach Wunsch).

#### 3. Modus an Unterseiten durchreichen
- `ZtLayout` gibt den Modus via React Context oder als Outlet-Context an die Kind-Routen weiter, damit Zusammenfassung, Buchhaltung und Brutto/Netto darauf reagieren können (Vorbereitung für die Extended-Logik).

### Betroffene Dateien
| Datei | Änderung |
|---|---|
| `src/hooks/useSfnMode.ts` | Neu: localStorage Hook |
| `src/pages/zeiterfassung/ZtLayout.tsx` | Toggle + Beschreibung + Outlet-Context |

**Hinweis**: Die eigentliche Extended-Berechnungslogik (additive Zuschläge, differenzierte Feiertage, DB-Migration) wird in einem Folgeschritt implementiert. Dieser Schritt erstellt nur den Toggle mit den Beschreibungen.




# Plan: Mobile Kellner Self-Service mit Zeitstempel

## Übersicht

Eine mobile Self-Service Seite für Kellner, die ihnen ermöglicht ihre Abrechnung selbstständig einzugeben, ihre Performance zu sehen und sich mit anderen Kellnern zu vergleichen. Der Manager sieht im Dashboard wann jede Abrechnung eingereicht wurde.

## 1. Datenbank-Änderung

### Neue Spalte: `submitted_at`

```sql
ALTER TABLE waiter_shifts 
ADD COLUMN submitted_at TIMESTAMPTZ;
```

Diese Spalte speichert den Zeitpunkt der letzten Aktualisierung durch den Kellner.

---

## 2. Neue Dateien

### 2.1 Mobile Layout (ohne Sidebar)

**Datei:** `src/components/layout/MobileLayout.tsx`

Ein schlankes Layout speziell für die mobile Kellner-Ansicht:
- Kompakter Header mit Logo + Benutzername + Logout
- Keine Navigation-Sidebar
- Touch-freundliches Design

### 2.2 Performance-Karte

**Datei:** `src/components/waiter/PerformanceCard.tsx`

Zeigt dem Kellner seine aktuelle und historische Performance:
- Aktuelles TG % der heutigen Schicht
- Historischer Durchschnitt (Ø TG %)
- Aktuelle Ranking-Position

### 2.3 Trinkgeld-Ranking

**Datei:** `src/components/waiter/TipRanking.tsx`

Leaderboard aller Kellner sortiert nach Trinkgeld-Performance:
- Medaillen für Top 3
- Trend-Indikatoren (steigend/fallend)
- Hervorhebung der eigenen Position

### 2.4 Mobile Self-Service Seite

**Datei:** `src/pages/WaiterMobile.tsx`

Die Hauptseite für Kellner am Handy:

```text
┌──────────────────────────────────────┐
│  🍴 Spicery              Max  [🚪]   │
├──────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Deine Performance      🏆 #2   │  │
│  │ Heute: 5.2%    Ø: 4.8%        │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Abrechnung 07.02.2026         │  │
│  │                               │  │
│  │ Umsatz           [     €    ] │  │
│  │ Abzugeb. Betrag  [     €    ] │  │
│  │ Kartenzahlung    [     €    ] │  │
│  │ Hilf Mahl        [     €    ] │  │
│  │ Offene Rechnung  [     €    ] │  │
│  │ Bargeld abgeg.   [     €    ] │  │
│  │                               │  │
│  │ ─────────────────────────────│  │
│  │ Erwartet:        125,00 €    │  │
│  │ Küche (2%):        8,50 €    │  │
│  │ Dein Trinkgeld:   16,50 €    │  │
│  │                               │  │
│  │ [ ✓ Abrechnung speichern ]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🏆 Trinkgeld Ranking          │  │
│  │                               │  │
│  │ 1. Lisa      5.8%  ▲ +0.3%   │  │
│  │ 2. Max (Du)  5.2%  ▼ -0.2%   │  │
│  │ 3. Tom       4.9%  ● ±0.0%   │  │
│  │ 4. Anna      4.5%  ▲ +0.1%   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 3. Neue Hooks

### 3.1 Kellner-Ranking Hook

**Datei:** `src/hooks/useSession.ts` (erweitern)

```typescript
interface WaiterRankingItem {
  name: string;
  avgTipPercent: number;
  shiftsCount: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  rank: number;
}

export function useWaiterRanking() {
  return useQuery({
    queryKey: ['waiter-ranking'],
    queryFn: async () => {
      // 1. Alle Sessions und Shifts laden
      // 2. Pro Kellner: Durchschnittliches TG % berechnen
      // 3. Trend berechnen (letzte vs. vorherige Sessions)
      // 4. Nach avgTipPercent sortieren und Rang zuweisen
      // 5. Array zurückgeben
    }
  });
}
```

---

## 4. Änderungen an bestehenden Dateien

### 4.1 TypeScript Typen

**Datei:** `src/types/database.ts`

```typescript
export interface WaiterShift {
  // ... bestehende Felder
  submitted_at: string | null;  // NEU
}
```

### 4.2 Session Hooks - Zeitstempel bei Save

**Datei:** `src/hooks/useSession.ts`

Die Hooks `useCreateWaiterShift` und `useUpdateWaiterShift` setzen automatisch `submitted_at`:

```typescript
// Bei Create
.insert({
  ...shift,
  submitted_at: new Date().toISOString()
})

// Bei Update
.update({
  ...updates,
  submitted_at: new Date().toISOString()
})
```

### 4.3 Routing

**Datei:** `src/App.tsx`

```typescript
<Route path="/waiter" element={
  <ProtectedRoute>
    <WaiterMobile />
  </ProtectedRoute>
} />
```

### 4.4 Manager Dashboard - Zeitstempel Anzeige

**Datei:** `src/pages/ManagerDashboard.tsx`

Neue Sektion mit Übersicht aller Kellner-Abrechnungen:

```text
┌────────────────────────────────────────────────────┐
│ 📋 Kellner-Abrechnungen                            │
├────────────────────────────────────────────────────┤
│ Name     │ Status      │ Eingereicht              │
│──────────┼─────────────┼──────────────────────────│
│ Max      │ ✓ Komplett  │ Heute, 21:35 Uhr         │
│ Lisa     │ ✓ Komplett  │ Heute, 21:42 Uhr         │
│ Tom      │ ⏳ Ausstehend│ -                        │
└────────────────────────────────────────────────────┘
```

Formatierung:
- Heute: "Heute, 21:35 Uhr"
- Gestern: "Gestern, 18:20 Uhr"
- Älter: "05.02.2026, 19:15 Uhr"

---

## 5. Sicherheit

- Kellner können nur ihre **eigene** Abrechnung erstellen/bearbeiten
- Check: `waiter_name === user.name`
- Ranking zeigt nur aggregierte Daten, keine Umsatzzahlen

---

## Zusammenfassung aller Änderungen

| Bereich | Datei | Änderung |
|---------|-------|----------|
| DB | Migration | `submitted_at` Spalte hinzufügen |
| Types | `src/types/database.ts` | `submitted_at` zu WaiterShift |
| Hook | `src/hooks/useSession.ts` | `submitted_at` bei Save setzen + `useWaiterRanking` |
| Layout | `src/components/layout/MobileLayout.tsx` | NEU: Schlankes mobiles Layout |
| Komponente | `src/components/waiter/PerformanceCard.tsx` | NEU: Performance-Anzeige |
| Komponente | `src/components/waiter/TipRanking.tsx` | NEU: Ranking-Liste |
| Seite | `src/pages/WaiterMobile.tsx` | NEU: Mobile Self-Service |
| Routing | `src/App.tsx` | Route `/waiter` hinzufügen |
| Dashboard | `src/pages/ManagerDashboard.tsx` | Kellner-Abrechnungen mit Zeitstempel |

---

## Ergebnis

- Kellner können ihre Abrechnung selbstständig am Handy eingeben
- Transparente Leistungsübersicht mit Motivation durch Ranking
- Manager sieht genau wann jeder Kellner seine Abrechnung eingereicht hat
- Das bestehende Desktop-System bleibt unverändert


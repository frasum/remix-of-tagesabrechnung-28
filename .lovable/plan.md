

## Küchen-Dienstplan Dual-View mit Paint-Mode

### Konzept

Eine neue Seite `/kueche-plan` zeigt beide Restaurants (Spicery + YUM) untereinander. Oben eine Toolbar mit den 4 Küchen-Skills als farbige Toggle-Buttons. Der aktive Skill gilt als "Pinsel" — jeder Klick auf eine leere Zelle weist diesen Skill zu, ein Klick auf eine belegte Zelle löscht sie.

### Layout

```text
┌──────────────────────────────────────────────────┐
│ Küchenplan           [◀ März 2026 ▶]             │
│                                                   │
│ [VS] [PASS] [SPÜLEN] [CO]  [✕ Löschen]          │
│  ^^^ farbige Toggle-Buttons, aktiver = hervorgehoben
│                                                   │
│ ▎ Spicery                                         │
│ ┌──────┬──┬──┬──┬──┬──┬──┬──┬──┐                │
│ │ Koch │26│27│28│29│30│01│02│Σ │                 │
│ │ Lisa │  │CO│  │CO│  │CO│CO│4 │  ← ein Klick   │
│ └──────┴──┴──┴──┴──┴──┴──┴──┴──┘                │
│                                                   │
│ ▎ YUM                                             │
│ ┌──────┬──┬──┬──┬──┬──┬──┬──┬──┐                │
│ │ Koch │26│27│28│29│30│01│02│Σ │                 │
│ │ Lisa │VS│  │VS│  │VS│  │  │3 │                 │
│ └──────┴──┴──┴──┴──┴──┴──┴──┴──┘                │
└──────────────────────────────────────────────────┘
```

### Interaktion

- **Skill auswählen**: Klick auf einen der farbigen Buttons oben (ToggleGroup, nur einer aktiv)
- **Zelle klicken**: Leere Zelle → weist den aktiven Skill zu (ein Klick, kein Popover)
- **Belegte Zelle klicken**: Löscht die Schicht (Toggle-Verhalten)
- **Löschen-Modus**: Ein separater "✕"-Button als Alternative zum Skill — löscht beim Klick
- **Kein Skill gewählt**: Klick öffnet das normale Popover als Fallback
- **Konflikte**: Amber-Marker wenn Mitarbeiter am selben Tag im anderen Restaurant eingeteilt

### Technische Umsetzung

1. **Neue Route** `/kueche-plan` in `App.tsx` (geschützt, Admin-only)
2. **Neue Seite** `src/pages/KuechePlan.tsx`:
   - Gemeinsame Toolbar mit Monatspicker + Skill-ToggleGroup
   - State `activeSkillId: string | null` + `deleteMode: boolean`
   - Zwei `MonthlyGrid`-Instanzen mit je festem `restaurantId`
3. **MonthlyGrid erweitern**:
   - Neuer optionaler Prop `restaurantId?: string` (überschreibt Context)
   - Neuer optionaler Prop `activeSkillId?: string | null` — wird an ShiftCell durchgereicht
   - Neuer optionaler Prop `deleteMode?: boolean`
4. **ShiftCell erweitern**:
   - Wenn `activeSkillId` gesetzt: Klick auf leere Zelle → direkt `upsertShift` mit dem Skill, kein Popover
   - Wenn `deleteMode`: Klick auf belegte Zelle → `deleteShift`
   - Wenn kein Mode aktiv: bisheriges Verhalten (Popover)
5. **Navigation**: Menüpunkt "Küchenplan" in der Sidebar

### Keine DB-Änderungen nötig

Nutzt die bestehenden `shift_assignments`, `skills` und `employee_skills` Tabellen.


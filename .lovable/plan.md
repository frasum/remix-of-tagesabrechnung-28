
## Globales Datum über Navigation hinweg beibehalten

### Übersicht
Wenn du ein Datum auswählst und dann zu anderen Seiten navigierst (z.B. von Kellner Abrechnung zu Dashboard zu Tagesabrechnung), soll das ausgewählte Datum beibehalten werden, anstatt auf das heutige Datum zurückzuspringen.

### Problem
Aktuell verwendet jede Seite ihren eigenen lokalen `useState` für das Datum:

| Seite | Aktueller Code |
|-------|----------------|
| WaiterCashUp | `useState(getBusinessDate())` |
| ManagerDashboard | `useState(getBusinessDate())` |
| KitchenTipSplit | `useState(new Date())` |
| DailySummary | `useState(new Date())` |
| RegisterBalance | `useState(getBusinessDate())` |
| CashBalance | `useState(new Date())` |
| History | `useState(new Date())` |

Beim Seitenwechsel wird der lokale State verloren und das Datum zurückgesetzt.

### Lösung
Ein **DateContext** erstellen, der das ausgewählte Datum global speichert und in allen betroffenen Seiten verwendet wird.

### Neue Datei

**`src/contexts/DateContext.tsx`**
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { getBusinessDate } from '@/utils/businessDate';

interface DateContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DateContext = createContext<DateContextValue | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(getBusinessDate());
  
  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

export function useSelectedDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useSelectedDate must be used within a DateProvider');
  }
  return context;
}
```

### Zu ändernde Dateien

| Datei | Änderung |
|-------|----------|
| `src/contexts/DateContext.tsx` | **NEU** - Globaler Date-Context |
| `src/App.tsx` | DateProvider einbinden |
| `src/pages/WaiterCashUp.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |
| `src/pages/ManagerDashboard.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |
| `src/pages/KitchenTipSplit.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |
| `src/pages/DailySummary.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |
| `src/pages/RegisterBalance.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |
| `src/pages/CashBalance.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |
| `src/pages/History.tsx` | Lokalen State durch `useSelectedDate()` ersetzen |

### Änderung in jeder Seite

**Vorher:**
```typescript
const [selectedDate, setSelectedDate] = useState(getBusinessDate());
```

**Nachher:**
```typescript
import { useSelectedDate } from '@/contexts/DateContext';

// In der Komponente:
const { selectedDate, setSelectedDate } = useSelectedDate();
```

### Ablauf nach der Änderung

```text
┌──────────────────────────────────────────────────────────────┐
│  Benutzer wählt: 5. Februar 2026                             │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│  DateContext speichert: 5. Februar 2026                      │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Kellner        │  │ Dashboard      │  │ Küchen TG      │
│ Abrechnung     │  │                │  │                │
│ ────────────── │  │ ────────────── │  │ ────────────── │
│ 5. Feb 2026 ✓  │  │ 5. Feb 2026 ✓  │  │ 5. Feb 2026 ✓  │
└────────────────┘  └────────────────┘  └────────────────┘
         ↓                  ↓                   ↓
         └──────────────────┴───────────────────┘
                            ↓
              Alle Seiten zeigen das gleiche Datum!
```

### Provider-Hierarchie in App.tsx

```typescript
<QueryClientProvider>
  <AuthProvider>
    <RestaurantProvider>
      <DateProvider>         ← NEU
        <TooltipProvider>
          <Toaster />
          <Routes>
            ...
          </Routes>
        </TooltipProvider>
      </DateProvider>        ← NEU
    </RestaurantProvider>
  </AuthProvider>
</QueryClientProvider>
```

### Vorteile
- **Einheitliches Datum**: Alle datumsbezogenen Seiten zeigen das gleiche Datum
- **Keine Verwirrung**: Du kontrollierst einen Tag und das Datum bleibt beim Navigieren erhalten
- **Einfache Implementierung**: Nur Provider hinzufügen und lokalen State ersetzen
- **"Heute"-Button funktioniert weiterhin**: Setzt das globale Datum zurück auf heute

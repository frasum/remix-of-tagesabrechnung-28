
## Plan: Manager Dashboard in Tagesabrechnung integrieren

### Ziel
Das Manager Dashboard vollständig in die Tagesabrechnung (DailySummary) integrieren, um eine einzige, übersichtliche Seite für tägliche Dateneingabe und Übersicht zu schaffen. Der Navigationspunkt "Manager Dashboard" wird entfernt.

---

## Strategie

Das bestehende **DailySummary-Layout** wird als Basis beibehalten und um die **Eingabefunktionalität des Manager Dashboards** erweitert:

```text
TAGESABRECHNUNG (erweitert)
├── Header (Datum + PDF Export)
├── Notizen-Karte (neu)
├── Warnungen (neu - POS/Terminal-Differenzen)
├── Stat-Cards (bestehend)
├── Kassenstand-Karte (bestehend)
├── EINGABE-BEREICH (neu - Manager Dashboard-Funktionalität)
│   ├── POS & Terminal
│   ├── Take Away
│   ├── Gutscheine & Abzüge
│   ├── Sonstiges
│   └── Ausgaben
└── Übersichts-Bereich (bestehend)
    ├── Einnahmen Übersicht
    ├── Abzüge Übersicht
    ├── Take Away Details
    └── Trinkgeld Übersicht
```

---

## Detaillierte Änderungen

### 1. DailySummary.tsx erweitern

**Neue State-Variablen:**
- `formData`: Alle Session-Eingabefelder (pos_total, terminal_1_total, vouchers_sold, etc.)
- `expenseDescription` und `expenseAmount`: Für Ausgaben-Erfassung

**Neue Hooks:**
- `useUpdateSession`: Für Auto-Save beim Ändern von Feldern
- `useCreateExpense` und `useDeleteExpense`: Für Ausgaben-Management

**Neue Funktionen:**
- `updateField()`: Auto-Save beim Ändern eines Session-Feldes
- `handleAddExpense()`: Hinzufügen von Ausgaben
- `handleDeleteExpense()`: Löschen von Ausgaben

**Neue UI-Sektionen (zwischen Kassenstand und bestehenden Übersichten):**
1. **Notizen-Karte**: Textarea für tägliche Notizen (Auto-Save)
2. **Warnungs-Banner**: POS-Differenz und Terminal-Differenz Warnungen
3. **Eingabe-Bereich** (6 Karten im Grid):
   - POS & Terminal (Vectron, Terminals, Kreditkartenumsatz GL)
   - Take Away (Takeaway GL, OrderSmart, Wolt mit Gesamtberechnung)
   - Gutscheine & Abzüge (Verkauf, Eingelöst, FineDine)
   - Sonstiges (Vorschuss, Einladung, Sonstige Einnahmen)
   - Ausgaben (mit Hinzufügen/Löschen-Funktionalität)
   - Bargeld-Preview (Read-Only, zeigt berechnetes Bargeld)

**Layout-Struktur:**
```text
Stat-Cards (4 Spalten) - BARGELD, Tagesumsatz, Kartenzahlungen, Take Away
↓
Kassenstand-Karte (nur wenn < 1.000 €)
↓
Notizen-Karte (oben prominent)
↓
Warnungs-Banner (nur bei Abweichungen)
↓
Eingabe-Bereich (6 Karten im md:grid-cols-2 lg:grid-cols-3 Layout)
├── POS & Terminal
├── Take Away
├── Gutscheine & Abzüge
├── Sonstiges
├── Ausgaben
└── Bargeld-Preview
↓
Übersichts-Bereich (4 Karten im lg:grid-cols-2 Layout - bestehend)
├── Einnahmen Übersicht
├── Abzüge Übersicht
├── Take Away Details
└── Trinkgeld Übersicht
```

---

### 2. AppLayout.tsx anpassen

**Navigation:**
- Entfernen von `{ path: 'manager', label: 'Manager Dashboard', icon: Settings, minLevel: 'manager' }` aus `allNavItems`
- Aktualisieren von `alwaysVisibleForManager`: Entfernen von `'manager'`, behalten `['', 'kitchen', 'summary', 'register-balance']`

**Auswirkung:** Manager sehen "Manager Dashboard" nicht mehr in der Navigation.

---

### 3. App.tsx anpassen

**Route entfernen:**
```typescript
// Vor:
{ path: 'manager', element: <ManagerDashboard /> }

// Nach:
// Eintrag komplett entfernt
```

---

### 4. Alte ManagerDashboard.tsx

**Aktion:** Datei bleibt zunächst bestehen (kann später gelöscht werden, wenn alles stabil läuft).

---

## Technische Implementierungs-Details

### Neue Imports in DailySummary.tsx
```typescript
// Zusätzliche Hooks
import { useUpdateSession } from '@/hooks/useSession';

// Zusätzliche Icons
import { Trash2, AlertTriangle } from 'lucide-react';

// Zusätzliche UI-Komponenten
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

// Bestehende Komponenten erweitern
import { CurrencyInput } from '@/components/shared/CurrencyInput';
```

### State Initialization
```typescript
const [formData, setFormData] = useState({
  spicery_counter: 0,
  pos_total: 0,
  terminal_1_total: 0,
  terminal_2_total: 0,
  ordersmart_revenue: 0,
  wolt_revenue: 0,
  vouchers_sold: 0,
  vouchers_redeemed: 0,
  finedine_vouchers: 0,
  vorschuss: 0,
  einladung: 0,
  sonstige_einnahme: 0,
  notes: '',
  takeaway_total: 0,
  card_total_gl: 0,
});

const [expenseDescription, setExpenseDescription] = useState('');
const [expenseAmount, setExpenseAmount] = useState(0);
```

### Sync-Logik (useEffect)
Beim Laden einer Session werden alle Session-Werte in `formData` synchronisiert.

### Auto-Save Funktion
```typescript
const updateField = async (field: keyof typeof formData, value: number | string) => {
  let updatedFormData: typeof formData | null = null;
  
  setFormData((prev) => {
    updatedFormData = { ...prev, [field]: value };
    return updatedFormData;
  });
  
  if (session?.id && updatedFormData) {
    try {
      await updateSession.mutateAsync({
        id: session.id,
        ...updatedFormData,
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
};
```

---

## Reihenfolge der Implementierung

1. **DailySummary.tsx erweitern:**
   - State-Variablen hinzufügen
   - useUpdateSession, useCreateExpense, useDeleteExpense Hooks importieren
   - updateField() Funktion implementieren
   - handleAddExpense() und handleDeleteExpense() Funktionen hinzufügen
   - useEffect für Sync-Logik hinzufügen
   - Notizen-Karte einfügen
   - Warnungs-Banner einfügen
   - Eingabe-Bereich mit 6 Karten einfügen (zwischen Kassenstand und Übersichten)

2. **AppLayout.tsx anpassen:**
   - 'manager' Eintrag aus allNavItems entfernen
   - alwaysVisibleForManager aktualisieren

3. **App.tsx anpassen:**
   - Manager Dashboard Route entfernen

4. **Testing:**
   - Alle Eingabefunktionen testen (Auto-Save)
   - Ausgaben hinzufügen/löschen testen
   - Warnungen bei Abweichungen prüfen
   - PDF Export mit neuen Daten testen
   - Navigation prüfen (Manager Dashboard sollte weg sein)

---

## Vorher/Nachher

**Vorher:**
- Zwei separate Seiten: "Manager Dashboard" (Eingabe) + "Tagesabrechnung" (Übersicht)
- Manager müssen zwischen zwei Seiten navigieren

**Nachher:**
- Eine Seite: "Tagesabrechnung" mit Eingabe + Übersicht
- Alles auf einer Seite, übersichtlicher, weniger Navigationslast

---

## Potenzielle Herausforderungen & Mitigierung

| Herausforderung | Lösung |
|---|---|
| Seite wird sehr lang | Bestehende Struktur mit Card-Grid ist modular, Scrolling ist normal für diese Art von Seiten |
| Auto-Save Performance | Wird bereits im Manager Dashboard verwendet, sollte stabil sein |
| State Management | useEffect Sync + updateField Auto-Save hat sich bewährt |
| Navigation-Breadcrumbs | Nicht nötig, "Tagesabrechnung" ist eindeutig |

---

## Dateien die geändert werden

| Datei | Typ | Beschreibung |
|-------|-----|-------------|
| `src/pages/DailySummary.tsx` | **Modify** | Erweitern mit Eingabefunktionalität |
| `src/components/layout/AppLayout.tsx` | **Modify** | 'manager' Navigation entfernen |
| `src/App.tsx` | **Modify** | Manager Dashboard Route entfernen |
| `.lovable/plan.md` | **Modify** | Dokumentation aktualisieren |


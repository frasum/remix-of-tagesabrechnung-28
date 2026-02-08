
# Plan: Monatlicher PDF-Export fuer Bargeldbestand

## Zusammenfassung
Ein Monatsauswahl-Dropdown und ein PDF-Export-Button werden zur Bargeldbestand-Seite hinzugefuegt. Der Benutzer kann einen Monat auswaehlen und dann die gefilterten Daten als PDF herunterladen.

## Funktionsweise

1. **Monatsauswahl**: Ein Dropdown oben auf der Seite zeigt alle verfuegbaren Monate (basierend auf den vorhandenen Sessions)
2. **Tabellen-Filterung**: Die Tabelle zeigt nur die Eintraege des ausgewaehlten Monats
3. **PDF-Export**: Ein Button generiert eine PDF mit allen Zeilen des ausgewaehlten Monats plus Summenzeile

**PDF-Inhalt:**
- Titel: "Bargeldbestand - [Monat Jahr]"
- Erstellungsdatum
- Tabelle mit allen Spalten wie in der UI
- Summenzeile am Ende
- Farbcodierung (gruen/rot) fuer Bargeld-Spalte

## Geplante Aenderungen

### 1. Neue PDF-Export-Funktion (pdfExport.ts)
Eine neue Funktion `generateCashBalancePDF` wird hinzugefuegt:
- Nimmt gefilterte Daten und Monat/Jahr als Parameter
- Erstellt Tabelle mit allen Spalten
- Fuegt Summenzeile hinzu
- Verwendet gleiches Design wie bestehender Daily Summary Export

### 2. CashBalance.tsx erweitern
- State fuer ausgewaehlten Monat hinzufuegen
- Monatsauswahl-Dropdown (Select-Komponente)
- PDF-Export-Button mit FileDown-Icon
- Daten nach Monat filtern
- Export-Funktion aufrufen

## UI-Aenderungen

```text
+--------------------------------------------------+
| [Wallet Icon] Bargeldbestand                     |
|                                                  |
| Monat: [Februar 2026 ▼]    [PDF Export Button]   |
|                                                  |
| +----------------------------------------------+ |
| | Taegliche Bargelduebersicht                 | |
| | Datum | Tagesumsatz | ... | Bargeld         | |
| | Sa 1.Feb | 4.800 € | ... | 145 €            | |
| | ...                                          | |
| | GESAMT | ... | 4.965 €                       | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

---

## Technische Details

### Neue Funktion: generateCashBalancePDF

```typescript
interface CashBalanceRow {
  date: string;
  kellnerUmsatz: number;
  kreditkarten: number;
  ordersmart: number;
  wolt: number;
  gutscheineEL: number;
  finedine: number;
  gutscheineVK: number;
  einladung: number;
  offeneRE: number;
  vorschuss: number;
  ausgaben: number;
  bargeld: number;
}

interface CashBalancePDFData {
  rows: CashBalanceRow[];
  month: number; // 0-11
  year: number;
}

export const generateCashBalancePDF = (data: CashBalancePDFData): void => {
  const doc = new jsPDF('landscape'); // Querformat wegen vieler Spalten
  
  // Header mit Monat/Jahr
  // Tabelle mit allen Zeilen
  // Summenzeile mit Farbcodierung
  // Speichern als "Bargeldbestand_2026-02.pdf"
};
```

### CashBalance.tsx Erweiterungen

```typescript
// Neue Imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { generateCashBalancePDF } from '@/utils/pdfExport';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// State fuer Monatsauswahl
const [selectedMonth, setSelectedMonth] = useState<string>(''); // Format: "2026-02"

// Verfuegbare Monate aus Daten extrahieren
const availableMonths = useMemo(() => {
  if (!data) return [];
  const months = new Set<string>();
  data.forEach(row => {
    const date = parseISO(row.date);
    months.add(format(date, 'yyyy-MM'));
  });
  return Array.from(months).sort().reverse();
}, [data]);

// Daten nach Monat filtern
const filteredData = useMemo(() => {
  if (!data || !selectedMonth) return data;
  return data.filter(row => row.date.startsWith(selectedMonth));
}, [data, selectedMonth]);

// Export-Handler
const handleExport = () => {
  if (!filteredData || filteredData.length === 0) return;
  const [year, month] = selectedMonth.split('-').map(Number);
  generateCashBalancePDF({
    rows: filteredData,
    month: month - 1,
    year,
  });
};
```

### Dateien die geaendert werden

1. **src/utils/pdfExport.ts** - Neue Funktion `generateCashBalancePDF` hinzufuegen
2. **src/pages/CashBalance.tsx** - Monatsauswahl, Filter und Export-Button hinzufuegen

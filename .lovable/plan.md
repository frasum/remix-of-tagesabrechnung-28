

## Kreditkartenumsatz GL zu Kellner-Kreditkarten addieren

### Zusammenfassung
Das Feld **"Kreditkartenumsatz GL"** (`card_total_gl`) aus der Session-Tabelle muss zum gesamten Kreditkartenumsatz der Kellner addiert werden. Dies ist im Manager-Dashboard bereits korrekt implementiert, fehlt aber in der Tagesabrechnung.

### Aktuelle Situation

| Datei | Status | Berechnung |
|-------|--------|------------|
| `ManagerDashboard.tsx` | ✅ Korrekt | `totalCardTotal = waiterShifts + card_total_gl` |
| `DailySummary.tsx` | ❌ Fehlt | `totalCardTotal = nur waiterShifts` |

### Auswirkung der Korrektur

**Beispiel:**
- Kellner Kartenzahlungen: 1.200 €
- Kreditkartenumsatz GL: 150 €

| Vorher | Nachher |
|--------|---------|
| Kartenzahlungen: **1.200 €** | Kartenzahlungen: **1.350 €** |
| Terminal Differenz: **150 €** | Terminal Differenz: **0 €** |

### Betroffene Datei

| Datei | Zeile | Änderung |
|-------|-------|----------|
| `src/pages/DailySummary.tsx` | 46 | `card_total_gl` zum `totalCardTotal` addieren |

---

### Technische Umsetzung

**Aktuell (Zeile 46):**
```typescript
const totalCardTotal = waiterShifts.reduce((sum, w) => sum + w.card_total, 0);
```

**Neu:**
```typescript
const totalCardTotal = waiterShifts.reduce((sum, w) => sum + w.card_total, 0) 
  + (session?.card_total_gl || 0);
```

---

### Was sich ändert

1. **StatCard "Kartenzahlungen"**: Zeigt jetzt die korrekte Summe (Kellner + GL)
2. **Terminal-Differenz-Berechnung**: Wird korrekt berechnet
3. **PDF-Export**: Erhält die korrigierte Kartenzahlungssumme

---

### Was unverändert bleibt

- BARGELD-Berechnung (verwendet `terminal_1_total + terminal_2_total`, nicht `totalCardTotal`)
- Manager-Dashboard (bereits korrekt implementiert)
- Die Terminal-Differenz-Warnung-Logik


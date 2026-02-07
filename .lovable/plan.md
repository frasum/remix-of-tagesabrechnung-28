

## Plan: "Takeaway GL" Feld an erste Stelle der Lieferplattformen

### Änderung

**Datei**: `src/pages/ManagerDashboard.tsx`

1. **Entfernen** aus der "POS & Terminal" Section (Zeilen 308-314):
   - Das Feld "KK Gesamtliste (GL)" mit `card_total_gl` wird entfernt

2. **Hinzufügen** zur "Lieferplattformen" Section als erstes Feld (Zeile 337):
   - Neues Feld mit Label "Takeaway GL" und `CurrencyInput` für `card_total_gl`
   - Wird VOR dem OrderSmart Feld eingefügt

### Resultat

Die "Lieferplattformen" Section wird dann folgende Reihenfolge haben:

| Position | Feld |
|----------|------|
| 1 | **Takeaway GL** (neu) |
| 2 | OrderSmart |
| 3 | Wolt |
| 4 | Take-Away Gesamt |

### Dateien die geändert werden

- `src/pages/ManagerDashboard.tsx` - Feld verschieben und umbenennen




## Team-Kasse: Zwei Kellner auf einem Kassenschlüssel

### Zusammenfassung

Wenn zwei Kellner zusammen an einem Kassenschlüssel arbeiten, sollen beide ihren Anteil am Trinkgeld-Pool erhalten. Dazu wird ein optionales Feld "Zweiter Kellner" zum Abrechnungsformular hinzugefuegt. Bei der Pool-Berechnung wird die Schicht dann als zwei separate Anteile gezaehlt.

---

### Wie es funktioniert

**Eingabe:**
- Im Abrechnungsformular erscheint ein neues optionales Feld "Zweiter Kellner"
- Nur wenn ein zweiter Kellner ausgewaehlt wird, teilen sich beide die Schicht

**Pool-Berechnung:**
- Eine Team-Schicht zaehlt als 2 Anteile im Pool (statt 1)
- Beide Kellner erscheinen in der Uebersicht mit gleichem Pool-Anteil
- In der Statistik werden beide Namen separat erfasst

**Beispiel:**
```text
Vor der Aenderung:
  Gerard allein = 1 Anteil am Pool

Nach der Aenderung (Team-Kasse):
  Gerard + Anna = 2 Anteile (jeder bekommt denselben Anteil wie andere Kellner)
```

---

### Visuelle Aenderung im Formular

```text
+-----------------------------------------------+
| Kellner auswählen                             |
| [Dropdown: Kellner wählen]                    |
|                                               |
| Zweiter Kellner (optional)                    |
| [Dropdown: Keiner / Kellner wählen]           |
|                                               |
| Umsatz          | Abzugebender Betrag         |
| [0,00 €]        | [0,00 €]                    |
| ...                                           |
+-----------------------------------------------+
```

---

### Technische Umsetzung

#### 1. Datenbank-Aenderung

Eine neue optionale Spalte in der `waiter_shifts` Tabelle:

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `second_waiter_name` | text (nullable) | Name des zweiten Kellners |

#### 2. Formular erweitern (`WaiterCashUp.tsx`)

- Neues State-Feld: `newSecondWaiterName`
- Neues StaffSelect-Dropdown unter dem ersten Kellner
- Option "Keiner" als Standard
- Filter: Zweiter Kellner kann nicht gleich erstem sein

#### 3. Pool-Berechnung anpassen

**Aktuell:**
```
waiterCount = Anzahl der Schichten
tipPerWaiter = totalPool / waiterCount
```

**Neu:**
```
waiterCount = Summe aller Kellner-Anteile (1 pro Schicht + 1 wenn zweiter Kellner)
tipPerWaiter = totalPool / waiterCount
```

#### 4. Uebersicht erweitern

- Schichten mit zwei Kellnern zeigen beide Namen an (z.B. "Gerard + Anna")
- Beide bekommen denselben Pool-Anteil in der Statistik

#### 5. Statistik-Hooks anpassen

**`useMonthlyStaffTips.ts` und `useWaiterTipAverages`:**
- Bei Team-Schichten beide Namen separat erfassen
- Jeder bekommt seinen individuellen Pool-Anteil gutgeschrieben

---

### Dateien die geaendert werden

| Datei | Aenderung |
|-------|----------|
| Datenbank | Neue Spalte `second_waiter_name` in `waiter_shifts` |
| `src/types/database.ts` | WaiterShift-Interface erweitern |
| `src/pages/WaiterCashUp.tsx` | Zweites Dropdown + Logik anpassen |
| `src/hooks/useSession.ts` | Create/Update um zweiten Kellner erweitern |
| `src/hooks/useMonthlyStaffTips.ts` | Team-Schichten korrekt zaehlen |

---

### Sonderfaelle

1. **Self-Service (`/waiter`):** Kellner auf dem Handy koennen keinen zweiten Kellner hinzufuegen - das macht nur der Manager
2. **Loeschen:** Wenn eine Team-Schicht geloescht wird, verlieren beide ihren Anteil
3. **Bearbeiten:** Beim Bearbeiten kann der zweite Kellner hinzugefuegt/entfernt werden


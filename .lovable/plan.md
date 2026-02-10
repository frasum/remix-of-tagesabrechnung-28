

## Telegram-Nachricht anpassen

Die Telegram-Zusammenfassung wird umgebaut, um folgende Kennzahlen pro Restaurant anzuzeigen:

### Was bleibt
- Vectron (POS-Umsatz)

### Was entfernt wird
- Bargeld
- Karten
- Ausgaben
- Kuchen-TG

### Was neu dazu kommt
1. **Kellner-Umsatze** -- Jeder Kellner mit seinem `pos_sales` (Leistung), sortiert nach Umsatz absteigend
2. **Abgabezeit** -- Wann jeder Kellner seine Abrechnung abgegeben hat (`submitted_at`)
3. **Manager/Ersteller** -- Wer die Tagesabrechnung erstellt hat (`created_by_name` aus der `sessions`-Tabelle)

### Beispiel-Nachricht

```
📊 Tagesumsatz 09.02.2026

Yum Spicery:
  Vectron: 3.450,00 €
  Erstellt von: Max Mustermann

  Kellner:
  • Anna: 1.200,00 € (Abgabe: 22:15)
  • Ben: 980,00 € (Abgabe: 22:30)
  • Clara: 750,00 € (Abgabe: 21:45)
```

### Technische Umsetzung
- Datei: `supabase/functions/send-telegram-summary/index.ts`
- Die bestehenden Berechnungen fur Bargeld, Karten, Ausgaben und Kuchen-TG werden entfernt
- Die `expenses`-Abfrage wird entfernt (nicht mehr benotigt)
- Kellner-Shifts werden nach `pos_sales` absteigend sortiert
- `submitted_at` wird als Uhrzeit (HH:MM) formatiert; falls nicht abgegeben, wird "ausstehend" angezeigt
- `session.created_by_name` wird als "Erstellt von" angezeigt
- Bei Team-Schichten (`second_waiter_name`) wird der zweite Kellner mit aufgefuhrt
- Redeploy der Edge Function nach der Anderung


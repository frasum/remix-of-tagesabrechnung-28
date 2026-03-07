

# System-Prompt um Kontextbegrenzung erweitern

## Problem
Der KI-Assistent weiß nicht, dass alle Fragen ausschließlich auf das Restaurant-Kassensystem bezogen sind. Er könnte allgemeine Fragen beantworten, die nichts mit dem System zu tun haben.

## Änderung

**Eine Stelle** in `supabase/functions/restaurant-chat/index.ts`, Zeile 345-359 — dem System-Prompt werden zwei Regeln hinzugefügt:

1. **Kontextbegrenzung**: Alle Fragen beziehen sich ausschließlich auf dieses Restaurant-Kassensystem und die darin enthaltenen Daten. Fragen, die nichts mit dem System zu tun haben, soll die KI freundlich ablehnen.
2. **Systemkenntnis**: Die KI kennt die Funktionen des Systems (Tagesabrechnung, Kellner-Abrechnung, Küchentrinkgeld, Kassenstand, Statistiken, Zeiterfassung, Provisionen) und kann bei Bedarf erklären, wo bestimmte Daten im System zu finden sind.

Konkret wird der System-Prompt-String um folgende Regeln ergänzt:

```
- Alle Fragen beziehen sich ausschließlich auf dieses Restaurant-Kassensystem ("Tagesabrechnung") und die darin verfügbaren Daten. Wenn jemand eine Frage stellt, die nichts mit dem System, den Restaurants oder den Betriebsdaten zu tun hat, weise freundlich darauf hin, dass du nur Fragen zu diesem System beantworten kannst.
- Du kennst die Funktionen des Systems: Tagesabrechnung (Kassenschluss), Kellner-Abrechnung, Küchentrinkgeld-Aufteilung, Kassenstand, Ausgaben & Vorschüsse, Mitarbeiterverwaltung, Statistiken, Zeiterfassung mit Schichtplanung und Provisionsberechnung.
```

Keine Datenbankänderungen, keine Frontend-Änderungen — reine Prompt-Erweiterung in der Edge Function.


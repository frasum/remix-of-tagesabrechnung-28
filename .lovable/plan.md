

## Analyse: Falsche FineDine-Antworten im Restaurant-Chat

### Ursache

Die Edge Function `restaurant-chat` gibt dem KI-Modell **alle Rohdaten der letzten 90 Tage als Text** (eine Zeile pro Session). Das Modell muss dann selbst hunderte Zeilen addieren. LLMs sind notorisch schlecht im Addieren langer Zahlenreihen — daher kommen bei jeder Anfrage unterschiedliche, falsche Summen heraus.

Die Daten selbst sind korrekt (die 13 Spicery-Sessions im Februar enthalten FineDine-Werte von 50+50+75+50+150+175+125+75+50+25+75+100+175 = 1.175 EUR). Das Modell verrechnet sich einfach.

Zusaetzlich: Die Supabase-Abfragen haben kein explizites `.limit()`, sodass bei grossem Datenvolumen der Default von 1.000 Zeilen greifen koennte (v.a. bei `waiter_shifts`).

### Loesung

Voraggregierte Monatssummen in den Kontext einfuegen, damit das Modell nicht mehr selbst rechnen muss.

| Datei | Aenderung |
|---|---|
| `supabase/functions/restaurant-chat/index.ts` | 1. Explizite `.limit(5000)` auf alle Abfragen setzen. 2. Einen neuen Abschnitt `=== MONATLICHE ZUSAMMENFASSUNG ===` erzeugen, der pro Restaurant und Monat die Summen berechnet (Umsatz, Kreditkarten, OrderSmart, Wolt, Gutschein-VK, Gutschein-Einloesung, FineDine, Einladung, Gaeste, Ausgaben, Vorschuesse). 3. Diesen Block VOR den Rohdaten in den System-Prompt einfuegen. |

### Technischer Ansatz

```typescript
// Nach dem Laden der Sessions: Aggregation pro Monat + Restaurant
const monthlyAgg: Record<string, Record<string, number>> = {};
sessions.forEach((s) => {
  const month = s.session_date.slice(0, 7); // "2026-02"
  const restaurant = restaurantMap[s.restaurant_id] || "?";
  const key = `${month}|${restaurant}`;
  if (!monthlyAgg[key]) monthlyAgg[key] = { /* alle Felder auf 0 */ };
  monthlyAgg[key].pos_total += s.pos_total || 0;
  monthlyAgg[key].finedine += s.finedine_vouchers || 0;
  // ... alle relevanten Felder
});
```

Der Kontext bekommt dann z.B.:
```
=== MONATLICHE ZUSAMMENFASSUNG ===
2026-02 | Spicery | Umsatz: 73.955€ | FineDine: 1.175€ | ...
```

So hat das Modell die korrekten Summen direkt verfuegbar und muss nicht selbst rechnen.




# Statistik „Gesamtumsatz" auf `sessions.pos_total` umstellen

## Ziel
Der „Gesamtumsatz" in der Statistik nutzt künftig `sessions.pos_total` statt der Summe `waiter_shifts.pos_sales` — damit stimmen Bargeldübersicht und Statistik exakt überein.

## Änderungen

### `src/hooks/useStatistics.ts`
- `kellnerUmsatz` pro Tag: statt `sum(shifts.pos_sales)` → `session.pos_total ?? 0`
- Filter „nur Tage mit Kellnerschichten" bleibt bestehen (verhindert Verzerrung der Durchschnitte)
- `summary.totalRevenue` und `summary.avgDailyRevenue` ergeben sich automatisch aus den neuen `dailyStats`
- Trinkgeld-/Pool-Berechnungen bleiben **unverändert** (basieren weiter korrekt auf den Kellner-Eingaben)

### `src/hooks/useStatisticsComparison.ts`
- Gleiche Umstellung auf `session.pos_total`, damit Vergleichszeiträume und Restaurant-Vergleich konsistent bleiben

## Nicht betroffen
- Lieferumsatz, Kreditkarten, Ausgaben, Trinkgeld-Pool, Charts-Logik
- Bargeldübersicht, Datenmodell, Migrationen

## Erwartetes Ergebnis
- Statistik-„Gesamtumsatz" für 01.–21.04. = Summe der `pos_total`-Werte derselben Tage in der Bargeldübersicht
- Differenz zwischen den Modulen verschwindet


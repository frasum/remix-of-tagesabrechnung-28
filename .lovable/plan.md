

# „+" Präfix bei positiven Beträgen entfernen

## Datei
`src/components/cash-balance/CashBalanceSummary.tsx`

## Änderung
In den beiden Kennzahlen „Übertrag aus Vormonat" und „Gesamt verfügbar" das `+`-Präfix entfernen. Negative Werte zeigen automatisch ihr `-` durch `formatCurrency`. Die bedingte Farblogik (grün/rot) bleibt unverändert.

Konkret: `{value >= 0 ? '+' : ''}{formatCurrency(value)}` → `{formatCurrency(value)}`


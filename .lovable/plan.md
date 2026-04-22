

# Bankeinzahlungen: Hinweis „mögliche Einzahlung" hinzufügen

## Ziel
Neben dem Label „Bankeinzahlungen" in der Karte „Aktueller Bargeldbestand" wird ein Klammer-Vermerk ergänzt, der den **maximal möglichen Einzahlungsbetrag** anzeigt — so, dass der Wechselgeld-Sockel von 2.000 € **nicht angetastet** wird.

## Logik

```text
Mögliche Einzahlung = max(0, Physisch in der Kasse − Wechselgeld-Sockel)
                    = max(0, operativer Saldo)
```

Beispiel Spicery (aktuell):
- Physisch: 5.198,13 €
- Wechselgeld-Sockel: 2.000,00 €
- → **Mögliche Einzahlung: 3.198,13 €**

Beispiel YUM (Defizit):
- Physisch: 1.859,00 € (operativer Saldo −141 €)
- Wechselgeld-Sockel: 2.000,00 €
- → **Mögliche Einzahlung: 0,00 €** (es darf nichts eingezahlt werden, sonst fehlt Wechselgeld)

## Anzeige

```text
🏛 Bankeinzahlungen (mögl. Einzahlung: 3.198,13 €) ⓘ        0,00 €
```

- Klammer-Vermerk in kleinerer, gedämpfter Schrift direkt hinter „Bankeinzahlungen"
- Tooltip auf das ⓘ-Icon erweitert: „Maximaler Betrag, der zur Bank gebracht werden kann, ohne den Wechselgeld-Sockel von [Betrag] € anzutasten."
- Wenn `mögliche Einzahlung = 0`, wird der Vermerk in **rot/destructive** dargestellt als Warnung („mögl. Einzahlung: 0,00 €"), damit auf einen Blick klar ist: aktuell ist keine Einzahlung möglich.

## Optional: Vorbelegung im Dialog
Beim Klick auf „BANKEINZAHLUNG" wird der `BankDepositDialog` mit der **möglichen Einzahlung** als Default-Betrag vorbelegt (statt leer). Der Nutzer kann ihn natürlich überschreiben.

## Betroffene Dateien
- `src/components/cash-balance/CashBalanceSummary.tsx` — Klammer-Vermerk + Tooltip-Anpassung
- `src/pages/CashBalance.tsx` — Default-Betrag an `BankDepositDialog` durchreichen
- `src/components/cash-balance/BankDepositDialog.tsx` — neuer optionaler Prop `defaultAmount`, Vorbelegung im Form-State

## Nicht betroffen
- `useCashBalanceData`, `compute_carry_over`, Datenmodell — der neue Wert wird rein aus bereits vorhandenen Props (`physical`, `pettyCash`) abgeleitet.
- Tagesabrechnung bleibt unberührt.

## Erwartetes Ergebnis
- Sofort sichtbar, wie viel heute zur Bank gebracht werden darf
- Wechselgeld-Sockel von 2.000 € wird systemisch geschützt (visuelle Leitplanke)
- Bei Defizit klare Warnung „0,00 € möglich"
- Komfort: Dialog mit sinnvollem Vorschlag vorbelegt


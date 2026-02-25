

# "Pro Mitarbeiter" Karte vergrößern

Die "Pro Mitarbeiter" StatCard soll die volle Breite einnehmen (über beide Spalten), damit sie optisch prominenter wirkt.

## Änderung in `src/pages/WaiterCashUp.tsx`

Die StatCard "Pro Mitarbeiter" bekommt `className="col-span-2"`, sodass sie die gesamte Breite des 2-Spalten-Grids einnimmt und damit doppelt so breit dargestellt wird.

```
Vorher:
[Trinkgeld ohne Küche] [Pro Mitarbeiter (4)]
[Trinkgeld %         ]

Nachher:
[Trinkgeld ohne Küche] [Trinkgeld %         ]
[       Pro Mitarbeiter (4)                  ]
```


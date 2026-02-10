

## Tresor-Feature komplett entfernen

Das gesamte Tresor-Feature wird aus dem Code entfernt: Seite, Navigation, Komponenten, Hook und alle Referenzen in ManagerDashboard und DailySummary.

### Dateien loeschen

- `src/pages/RegisterBalance.tsx`
- `src/components/register/TransferDialog.tsx`
- `src/components/register/TransferList.tsx`
- `src/components/register/RegisterCard.tsx`
- `src/hooks/useRegisterTransfers.ts`

### Dateien bearbeiten

**1. `src/components/layout/AppLayout.tsx`**
- Zeile 51 entfernen: `{ path: 'register-balance', label: 'Tresor', icon: Vault, minLevel: 'manager' }`
- Import `Vault` entfernen (Zeile 15)

**2. `src/App.tsx`**
- Import `RegisterBalance` entfernen (Zeile 30)
- Route `register-balance` entfernen (Zeile 48)

**3. `src/types/permissions.ts`**
- `'register-balance'` Eintrag aus `NAV_PERMISSIONS` entfernen
- `{ path: 'register-balance', label: 'Tresor' }` aus `MANAGER_NAV_ITEMS` entfernen

**4. `src/pages/DailySummary.tsx`**
- Import `useRegisterTransfers` und `TransferDialog` entfernen (Zeilen 24-25)
- Import `Vault` aus lucide entfernen (Zeile 5)
- State `showTransferDialog` entfernen (Zeile 50)
- Hook-Aufruf `useRegisterTransfers` entfernen (Zeile 94)
- Variablen `todaysVaultTransfers`, `todaysRegisterBalance`, `showCashBalanceCard`, `initialRestaurantBalance` entfernen (Zeilen 283-292)
- Funktion `handleTransferSubmit` entfernen (Zeilen 309-320)
- Kassenstand-Card und TransferDialog aus dem JSX entfernen

**5. `src/pages/ManagerDashboard.tsx`**
- Import `useRegisterTransfers` und `TransferDialog` entfernen (Zeilen 20-21)
- Import `Vault` aus lucide entfernen (Zeile 6)
- State `showTransferDialog` entfernen (Zeile 38)
- Hook-Aufruf `useRegisterTransfers` entfernen (Zeile 249)
- Tresor-bezogene Variablen und Kassenstand-Logik entfernen
- Funktion `handleTransferSubmit` entfernen
- Kassenstand-Card und TransferDialog aus dem JSX entfernen

### Nicht betroffen

- Datenbank-Tabelle `register_transfers` bleibt bestehen
- `usePettyCash` in `useSettings.ts` bleibt (wird vom Bargeldbestand-Feature genutzt)


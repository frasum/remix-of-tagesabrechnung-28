

## Plan: Login case-insensitiv machen & Update-Fehler beheben

### Problem 1: Case-sensitiver Login
Die `validate-pin` Edge Function verwendet `.eq("name", name)` — ein exakter, case-sensitiver Vergleich. "Chefin" ≠ "CHEFIN".

**Fix:** In `supabase/functions/validate-pin/index.ts` den Vergleich auf case-insensitiv umstellen:
```typescript
// Zeile 149: .eq("name", name) ersetzen durch:
.ilike("name", name)
```

### Problem 2: Staff-Update-Fehler debuggen
Ohne Console-Logs ist die Ursache unklar. Zwei Maßnahmen:

1. **Besseres Error-Logging in `useUpdateStaff`** (`src/hooks/useStaff.ts`): Den tatsächlichen Fehlertext in die Toast-Nachricht aufnehmen, damit der Fehler sichtbar wird:
```typescript
onError: (error) => {
  const msg = error instanceof Error ? error.message : 'Unbekannter Fehler';
  toast.error(`Fehler beim Aktualisieren: ${msg}`);
  console.error('Error updating staff:', error);
},
```

2. **`update-pin` Edge Function absichern**: Die Funktion braucht aktuell eine OAuth-Session. Für PIN-basierte Admins den gleichen `x-staff-id` Fallback einbauen wie in den anderen Edge Functions (manage-user-role etc.), damit PINs auch ohne OAuth-Login geändert werden können.

### Dateien
- `supabase/functions/validate-pin/index.ts` — `.eq()` → `.ilike()`
- `supabase/functions/update-pin/index.ts` — x-staff-id Fallback hinzufügen
- `src/hooks/useStaff.ts` — Fehlermeldung verbessern


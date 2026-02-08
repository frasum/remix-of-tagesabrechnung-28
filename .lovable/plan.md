
# Fix: Verknüpftes OAuth-Konto im Dialog anzeigen und aufheben

## Problem-Analyse

Die Verknüpfung existiert bereits in der Datenbank (`frasum@gmail.com` → `Frank`), wird aber nicht im Dialog angezeigt, weil:

1. **Fehlender Foreign Key**: Der Join `profiles!profiles_staff_id_fkey` in der `useStaff` Query funktioniert nicht, da kein Foreign Key zwischen `profiles.staff_id` und `staff.id` definiert ist.

2. **Deshalb ist `staff.linked_profile` immer `null`** - die Verknüpfungsanzeige (grüner Bereich mit "Aufheben"-Button) wird nie gezeigt.

## Lösungen

### Option 1: Foreign Key in der Datenbank erstellen (empfohlen)
```sql
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_staff_id_fkey 
FOREIGN KEY (staff_id) REFERENCES public.staff(id) 
ON DELETE SET NULL;
```

### Option 2: Query anpassen (alternative Falls FK nicht möglich)
Falls der Foreign Key nicht erstellt werden kann, die Query auf eine manuelle Subquery umstellen.

---

## Geplante Änderungen

### Datenbank-Migration

| Änderung | SQL |
|----------|-----|
| Foreign Key erstellen | `ALTER TABLE profiles ADD CONSTRAINT profiles_staff_id_fkey...` |

Das ermöglicht den bestehenden Join in `useStaff`:
```typescript
profiles!profiles_staff_id_fkey (
  id, user_id, email, full_name, avatar_url
)
```

---

## Ergebnis

Nach der Migration wird:

```text
┌─────────────────────────────────────────────────┐
│ OAuth-Konto verknüpfen                          │
├─────────────────────────────────────────────────┤
│ ✅ Verknüpft mit: frasum@gmail.com              │
│    (frank schumann)                             │
│                            [🔗 Aufheben]        │
└─────────────────────────────────────────────────┘
```

Anstatt der aktuellen Meldung "Keine nicht verknüpften OAuth-Benutzer verfügbar".

Der "Aufheben"-Button ist bereits implementiert (Zeilen 241-257 in StaffDialogNative.tsx) und ruft `handleUnlink()` auf, welches die Edge Function `admin-link-account` mit `action: 'unlink'` aufruft.


# Fix: OAuth-Benutzer-Profile und Manager-Verknüpfung

## Problem-Analyse

### Problem 1: Keine Profile werden erstellt
Die `profiles`-Tabelle ist komplett leer. Der `handle_new_user` Trigger existiert zwar, aber es fehlt möglicherweise der Auth-Trigger, der ihn bei neuen Benutzern aufruft.

### Problem 2: RLS blockiert Manager-Zugriff
Die aktuelle RLS-Policy auf `profiles` erlaubt nur Benutzern ihre eigenen Profile zu sehen:
```sql
USING (auth.uid() = user_id)
```

Manager müssen aber alle Profile ohne `staff_id` sehen können, um Verknüpfungen zu erstellen.

---

## Lösungen

### 1. Auth Trigger erstellen
Der Trigger `handle_new_user` existiert, aber er muss an `auth.users` gebunden werden:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. RLS-Policy für Profile erweitern
Neue SELECT-Policy, die das Lesen aller Profile mit `staff_id IS NULL` erlaubt (für Manager):

```sql
-- Manager/App können unverknüpfte Profile lesen
CREATE POLICY "Allow reading unlinked profiles"
  ON public.profiles FOR SELECT
  USING (staff_id IS NULL);
```

Alternativ: Das Laden der unverknüpften Profile über die Edge Function `admin-link-account` erledigen (sicherer).

### 3. Edge Function erweitern: get-unlinked-profiles
Da die bestehende `admin-link-account` Edge Function bereits den Service Role Key verwendet, können wir diese erweitern oder eine neue Funktion erstellen, die alle unverknüpften Profile zurückgibt:

```typescript
// GET /functions/v1/admin-link-account?action=list-unlinked
// Gibt alle Profile ohne staff_id zurück
```

---

## Änderungen

### Datenbank-Migrationen

| Änderung | SQL |
|----------|-----|
| Auth Trigger erstellen | `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users...` |
| RLS Policy hinzufügen | `CREATE POLICY "Allow reading unlinked profiles"...` |

### Edge Function erweitern

| Datei | Änderung |
|-------|----------|
| `supabase/functions/admin-link-account/index.ts` | GET-Methode für Liste der unverknüpften Profile |

### Frontend Hook anpassen

| Datei | Änderung |
|-------|----------|
| `src/hooks/useProfiles.ts` | Statt direkter Supabase-Abfrage Edge Function aufrufen |

---

## Technische Details

### Edge Function: admin-link-account (erweitert)

```typescript
Deno.serve(async (req) => {
  // GET: Liste unverknüpfte Profile
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, email, full_name, avatar_url, staff_id')
      .is('staff_id', null)
      .order('email', { ascending: true });
    
    return new Response(JSON.stringify(data), { ... });
  }
  
  // POST: Link/Unlink (bestehende Logik)
  // ...
});
```

### useUnlinkedProfiles Hook (angepasst)

```typescript
export function useUnlinkedProfiles() {
  return useQuery({
    queryKey: ['profiles', 'unlinked'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-link-account`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    },
  });
}
```

---

## Benutzer-Ergebnis

Nach der Implementierung:
1. Bei OAuth-Login wird automatisch ein Profil in der `profiles`-Tabelle erstellt
2. Manager können in der Mitarbeiterverwaltung alle OAuth-Benutzer ohne Verknüpfung sehen
3. Manager können diese Profile direkt mit Mitarbeitern verknüpfen
4. Dein Konto (frasum@gmail.com) wird nach erneutem Login sichtbar sein

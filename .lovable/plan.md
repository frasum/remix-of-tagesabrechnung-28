
# Manager-Verknüpfungsverwaltung für OAuth-Konten

## Übersicht
Erweiterung der Mitarbeiterverwaltung um die Möglichkeit, OAuth-Benutzer (Google/Apple) direkt mit Mitarbeiter-Profilen zu verknüpfen. Dies ermöglicht es Managern, Verknüpfungen zentral zu verwalten, ohne dass Kellner ihren PIN eingeben müssen.

## Aktueller Stand
- OAuth-Benutzer können sich selbst über den `AccountLinkingDialog` mit ihrem PIN verknüpfen
- Die `profiles` Tabelle speichert `staff_id` für die Verknüpfung
- Die Mitarbeiterverwaltung zeigt aktuell keinen Verknüpfungsstatus an

## Änderungen

### 1. useStaff Hook erweitern
Laden der verknüpften OAuth-Profile für jeden Mitarbeiter:

```typescript
// Erweiterte Query mit Profile-Join
.select(`
  *,
  staff_restaurants (...),
  profiles!profiles_staff_id_fkey (
    id,
    email,
    full_name,
    avatar_url
  )
`)
```

Neues Feld im Interface:
```typescript
interface Staff {
  // ... existing
  linked_profile?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
```

### 2. StaffCard Komponente erweitern
Anzeige des Verknüpfungsstatus mit Badge:
- Grüner Badge mit Smartphone-Icon wenn verknüpft
- Tooltip mit verknüpfter E-Mail-Adresse

### 3. Neue Edge Function: admin-link-account
Manager-spezifische Verknüpfungsfunktion ohne PIN-Validierung:

```typescript
// Endpoint: POST /functions/v1/admin-link-account
// Body: { staff_id: string, user_id: string }
// oder: { staff_id: string, email: string }
```

Sicherheit:
- Nur für authentifizierte Benutzer (Manager)
- Überprüft ob der OAuth-Benutzer existiert
- Verhindert Doppelverknüpfungen

### 4. StaffDialog erweitern - OAuth-Verknüpfungssektion
Neue Sektion im Bearbeitungsdialog:

```
┌─────────────────────────────────────────────────┐
│ OAuth-Konto verknüpfen                          │
├─────────────────────────────────────────────────┤
│ ✅ Verknüpft mit: max@gmail.com                 │
│    [Verknüpfung aufheben]                       │
├─────────────────────────────────────────────────┤
│ oder                                            │
├─────────────────────────────────────────────────┤
│ Nicht verknüpfte OAuth-Benutzer:                │
│ ○ anna@gmail.com (Anna Schmidt)                 │
│ ○ peter@icloud.com (Peter Müller)               │
│    [Verknüpfen]                                 │
└─────────────────────────────────────────────────┘
```

### 5. Hook für unverknüpfte Profile
Neuer Hook um OAuth-Benutzer ohne Mitarbeiter-Verknüpfung zu laden:

```typescript
function useUnlinkedProfiles() {
  return useQuery({
    queryKey: ['profiles', 'unlinked'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, avatar_url')
        .is('staff_id', null);
      return data;
    },
  });
}
```

---

## Technische Details

### Neue Dateien

| Datei | Beschreibung |
|-------|--------------|
| `supabase/functions/admin-link-account/index.ts` | Edge Function für Manager-Verknüpfung |
| `src/hooks/useProfiles.ts` | Hook für Profile-Abfragen |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/hooks/useStaff.ts` | Profile-Join, linked_profile Feld |
| `src/components/staff/StaffCard.tsx` | OAuth-Badge mit Status |
| `src/components/staff/StaffDialogNative.tsx` | Neue Verknüpfungssektion |
| `supabase/config.toml` | Neue Edge Function registrieren |

### Edge Function: admin-link-account

```typescript
// Hauptlogik
Deno.serve(async (req) => {
  // 1. Authentifizierung prüfen
  // 2. staff_id und email/user_id aus Body lesen
  
  // 3. Prüfen ob Profil existiert
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, user_id, staff_id')
    .eq('email', email)
    .single();
  
  // 4. Prüfen ob bereits verknüpft
  if (profile.staff_id && profile.staff_id !== staff_id) {
    return error('Bereits mit anderem Mitarbeiter verknüpft');
  }
  
  // 5. Verknüpfung erstellen/aufheben
  await supabaseAdmin
    .from('profiles')
    .update({ staff_id: staff_id || null })
    .eq('id', profile.id);
});
```

### RLS Policy Anpassung
Die bestehende RLS Policy auf `profiles` erlaubt nur Benutzern ihre eigenen Profile zu ändern. Für Manager-Verknüpfungen verwenden wir den Service Role Key in der Edge Function.

## Benutzer-Flow

```text
Manager öffnet Mitarbeiterverwaltung
            │
            ▼
┌─────────────────────────────────────────────────┐
│  StaffCard zeigt:                               │
│  • Max Mustermann  [🔗 OAuth verknüpft]         │
│  • Anna Schmidt    [nicht verknüpft]            │
└─────────────────────────────────────────────────┘
            │
            ▼ (klickt "Bearbeiten" bei Anna)
┌─────────────────────────────────────────────────┐
│  StaffDialog mit neuer Sektion:                 │
│  "OAuth-Konto verknüpfen"                       │
│  → Wählt anna@gmail.com aus Liste               │
│  → Klickt "Verknüpfen"                          │
└─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────┐
│  admin-link-account Edge Function               │
│  → Verknüpft profile mit staff_id               │
│  → Query Cache invalidiert                      │
└─────────────────────────────────────────────────┘
            │
            ▼
    StaffCard zeigt jetzt:
    Anna Schmidt [🔗 OAuth verknüpft]
```

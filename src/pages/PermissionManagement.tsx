import { useState, useEffect } from 'react';
import { GlobalLayout } from '@/components/layout/GlobalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Save } from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import { useAllManagerNavPermissions, useSaveManagerNavPermissions } from '@/hooks/useManagerNavPermissions';
import { MANAGER_NAV_ITEMS } from '@/types/permissions';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

function useAllUserRoles() {
  return useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('staff_id, permission_level');
      if (error) throw error;
      return data || [];
    },
  });
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
  'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function PermissionManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: staffList = [], isLoading: staffLoading } = useStaff(undefined, { includeLinkedProfiles: true });
  const { data: allPermissions = {}, isLoading: permissionsLoading } = useAllManagerNavPermissions();
  const { data: userRoles = [], isLoading: rolesLoading } = useAllUserRoles();
  const savePermissions = useSaveManagerNavPermissions();

  const [localPermissions, setLocalPermissions] = useState<Record<string, string[]>>({});
  const [savingStaffId, setSavingStaffId] = useState<string | null>(null);

  const managers = staffList.filter(staff => {
    const role = userRoles.find(r => r.staff_id === staff.id);
    return role?.permission_level === 'manager';
  });

  useEffect(() => {
    if (Object.keys(allPermissions).length > 0 || !permissionsLoading) {
      const initial: Record<string, string[]> = {};
      managers.forEach(manager => {
        initial[manager.id] = allPermissions[manager.id] || [];
      });
      setLocalPermissions(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPermissions, managers.length, permissionsLoading]);

  const handleToggle = (staffId: string, path: string, checked: boolean) => {
    setLocalPermissions(prev => {
      const current = prev[staffId] || [];
      return checked
        ? { ...prev, [staffId]: [...current, path] }
        : { ...prev, [staffId]: current.filter(p => p !== path) };
    });
  };

  const handleSave = async (staffId: string) => {
    setSavingStaffId(staffId);
    try {
      await savePermissions.mutateAsync({
        staffId,
        paths: localPermissions[staffId] || [],
        callerStaffId: user?.id || '',
      });
      toast({ title: 'Berechtigungen gespeichert', description: 'Die Navigationsberechtigungen wurden aktualisiert.' });
    } catch {
      toast({ title: 'Fehler', description: 'Berechtigungen konnten nicht gespeichert werden.', variant: 'destructive' });
    } finally {
      setSavingStaffId(null);
    }
  };

  const isLoading = staffLoading || permissionsLoading || rolesLoading;

  const hasChanges = (staffId: string) => {
    const original = allPermissions[staffId] || [];
    const current = localPermissions[staffId] || [];
    if (original.length !== current.length) return true;
    return !original.every(p => current.includes(p));
  };

  return (
    <GlobalLayout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Berechtigungen verwalten</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isLoading
                  ? 'Lade Manager…'
                  : `${managers.length} Manager · Navigationszugriff konfigurieren`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map(i => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(j => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : managers.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">Keine Manager gefunden</p>
              <p className="text-muted-foreground text-sm mt-1">
                Weisen Sie zunächst Mitarbeitern die Manager-Rolle zu.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {managers.map(manager => {
              const currentPaths = localPermissions[manager.id] || [];
              const hasNoRestrictions = currentPaths.length === 0;
              const initial = manager.name.charAt(0).toUpperCase();

              return (
                <Card key={manager.id} className="border-border/50 bg-gradient-to-br from-card to-card/80">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${getAvatarColor(manager.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                        {initial}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{manager.name}</CardTitle>
                        <CardDescription>
                          {hasNoRestrictions
                            ? 'Vollzugriff auf alle Manager-Bereiche'
                            : `${currentPaths.length} Bereich(e) freigeschaltet`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {hasNoRestrictions
                          ? 'Wählen Sie Bereiche aus, um den Zugriff einzuschränken. Ohne Auswahl hat der Manager Zugriff auf alle Bereiche.'
                          : 'Aktivierte Bereiche sind für diesen Manager sichtbar.'}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                        {MANAGER_NAV_ITEMS.map(item => (
                          <div key={item.path} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`${manager.id}-${item.path}`}
                              checked={currentPaths.includes(item.path)}
                              onCheckedChange={(checked) =>
                                handleToggle(manager.id, item.path, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`${manager.id}-${item.path}`}
                              className="text-sm cursor-pointer leading-tight"
                            >
                              {item.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={() => handleSave(manager.id)}
                          disabled={!hasChanges(manager.id) || savingStaffId === manager.id}
                          size="sm"
                          className="shadow-sm"
                        >
                          {savingStaffId === manager.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Speichern
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </GlobalLayout>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AllPermissions {
  [staffId: string]: string[];
}

// Hook to fetch all manager permissions (for admin page) - uses direct DB query
export function useAllManagerNavPermissions() {
  return useQuery({
    queryKey: ['manager-nav-permissions-all'],
    queryFn: async (): Promise<AllPermissions> => {
      const { data, error } = await supabase
        .from('manager_nav_permissions')
        .select('staff_id, nav_path');

      if (error) {
        console.error('Failed to fetch all manager nav permissions:', error);
        return {};
      }

      const grouped: Record<string, string[]> = {};
      for (const row of data || []) {
        if (!grouped[row.staff_id]) {
          grouped[row.staff_id] = [];
        }
        grouped[row.staff_id].push(row.nav_path);
      }
      return grouped;
    },
  });
}

// Hook to fetch permissions for a specific staff member - uses direct DB query
export function useManagerNavPermissions(staffId: string | undefined) {
  return useQuery({
    queryKey: ['manager-nav-permissions', staffId],
    queryFn: async (): Promise<string[]> => {
      if (!staffId) return [];

      const { data, error } = await supabase
        .from('manager_nav_permissions')
        .select('nav_path')
        .eq('staff_id', staffId);

      if (error) {
        console.error('Failed to fetch manager nav permissions:', error);
        return [];
      }

      return (data || []).map(p => p.nav_path);
    },
    enabled: !!staffId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to save permissions for a manager
export function useSaveManagerNavPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, paths, callerStaffId }: { staffId: string; paths: string[]; callerStaffId: string }) => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-nav-permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ staff_id: staffId, paths, caller_staff_id: callerStaffId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save manager nav permissions');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['manager-nav-permissions-all'] });
      queryClient.invalidateQueries({ queryKey: ['manager-nav-permissions', variables.staffId] });
    },
  });
}

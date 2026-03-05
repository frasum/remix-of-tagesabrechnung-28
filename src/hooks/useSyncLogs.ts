import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SyncLog {
  id: string;
  restaurant_id: string;
  session_date: string;
  staff_name: string;
  reason: string;
  source: string;
  created_at: string;
}

export function useSyncLogs(restaurantId: string, limit = 20) {
  return useQuery({
    queryKey: ['zt-sync-logs', restaurantId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zt_sync_logs')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as SyncLog[];
    },
    enabled: !!restaurantId,
  });
}

export function useDeleteSyncLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('zt_sync_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zt-sync-logs'] }),
  });
}

export async function logSyncError(params: {
  restaurantId: string;
  sessionDate: string;
  staffName: string;
  reason: string;
  source?: string;
}) {
  const { error } = await supabase.from('zt_sync_logs').insert({
    restaurant_id: params.restaurantId,
    session_date: params.sessionDate,
    staff_name: params.staffName,
    reason: params.reason,
    source: params.source || 'waiter',
  });
  if (error) console.error('Failed to log sync error:', error);
}

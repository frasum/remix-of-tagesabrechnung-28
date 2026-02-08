import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PettyCashValue {
  amount: number;
}

export function usePettyCash(restaurantId: string | null) {
  const queryClient = useQueryClient();

  const { data: pettyCash, isLoading } = useQuery({
    queryKey: ['settings', 'petty_cash', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return 0;
      
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'petty_cash')
        .eq('restaurant_id', restaurantId)
        .single();

      if (error) throw error;
      const value = data?.value as unknown as PettyCashValue | undefined;
      return value?.amount ?? 0;
    },
    enabled: !!restaurantId,
  });

  const { mutate: updatePettyCash, isPending: isUpdating } = useMutation({
    mutationFn: async ({ amount, restaurantId: restId }: { amount: number; restaurantId: string }) => {
      // First try to update
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .eq('key', 'petty_cash')
        .eq('restaurant_id', restId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('settings')
          .update({ value: { amount } })
          .eq('key', 'petty_cash')
          .eq('restaurant_id', restId);

        if (error) throw error;
      } else {
        // Insert if not exists
        const { error } = await supabase
          .from('settings')
          .insert({ key: 'petty_cash', value: { amount }, restaurant_id: restId });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'petty_cash', restaurantId] });
    },
  });

  return {
    pettyCash: pettyCash ?? 0,
    isLoading,
    updatePettyCash,
    isUpdating,
  };
}

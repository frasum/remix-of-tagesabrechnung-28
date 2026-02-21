import { useMemo } from 'react';
import { format } from 'date-fns';
import { useCashBalanceData } from './useCashBalanceData';

/**
 * Derives the previous-day deficit from the shared useCashBalanceData hook.
 * No additional DB queries needed – this eliminates duplicate fetching.
 */
export function usePreviousDayDeficit(date: Date, restaurantId: string | null) {
  const { data: cashRows, isLoading, error } = useCashBalanceData(restaurantId);
  const dateStr = format(date, 'yyyy-MM-dd');

  const deficit = useMemo(() => {
    if (!cashRows || cashRows.length === 0) return 0;

    // Find all rows before the selected date
    const previousRows = cashRows.filter(r => r.date < dateStr);
    if (previousRows.length === 0) return 0;

    // The last row's chained bargeld tells us the carry-over
    const lastRow = previousRows[previousRows.length - 1];
    // bargeld already includes deficit chaining, so if negative it IS the deficit
    return lastRow.bargeld < 0 ? lastRow.bargeld : 0;
  }, [cashRows, dateStr]);

  return {
    data: deficit,
    isLoading,
    error,
  };
}

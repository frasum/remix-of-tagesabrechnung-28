import { useMemo } from 'react';
import { format } from 'date-fns';
import { useCashBalanceData } from './useCashBalanceData';

/**
 * Returns the previous business day's standalone cash result, capped at 0
 * (only deficits). This is intentionally NOT the cumulative carry-over —
 * the daily settlement (Tagesabrechnung) treats each day's float as 2.000 €
 * and only inherits a deficit from the immediate previous day, while
 * surpluses belong to the bank deposit pipeline shown in the Bargeldbestand.
 *
 * - Previous day rawBargeld < 0 → returns that negative value
 * - Previous day rawBargeld ≥ 0 → returns 0
 * - No previous day with data → returns 0
 */
export function usePreviousDayDeficit(date: Date, restaurantId: string | null) {
  const { data: cashRows, isLoading, error } = useCashBalanceData(restaurantId);
  const dateStr = format(date, 'yyyy-MM-dd');

  const carry = useMemo(() => {
    if (!cashRows || cashRows.length === 0) return 0;

    // Find the latest day strictly before today that has data
    const previousRows = cashRows.filter(r => r.date < dateStr);
    if (previousRows.length === 0) return 0;

    const lastDay = previousRows[previousRows.length - 1];
    return lastDay.rawBargeld < 0 ? lastDay.rawBargeld : 0;
  }, [cashRows, dateStr]);

  return {
    data: carry,
    isLoading,
    error,
  };
}

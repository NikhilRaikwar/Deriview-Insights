import { useState, useCallback, useMemo } from 'react';
import { AnalyticsFilters, Trade } from '@/lib/types';
import { filterTrades } from '@/lib/analytics';

const defaultFilters: AnalyticsFilters = {
  dateRange: { from: null, to: null },
  symbol: 'ALL',
  marketType: 'all',
  side: 'all',
};

export function useFilters(trades: Trade[]) {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  const filtered = useMemo(() => filterTrades(trades, filters), [trades, filters]);

  const updateFilter = useCallback(<K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const symbols = useMemo(() => {
    const set = new Set(trades.map(t => t.symbol));
    return ['ALL', ...Array.from(set).sort()];
  }, [trades]);

  return { filters, filtered, updateFilter, resetFilters, symbols };
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalyticsFilters } from '@/lib/types';

interface FilterBarProps {
  filters: AnalyticsFilters;
  symbols: string[];
  tradeCount: number;
  onUpdateFilter: <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, symbols, tradeCount, onUpdateFilter, onReset }: FilterBarProps) {
  return (
    <Card className="p-3 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">From</label>
          <input
            type="date"
            className="h-8 rounded-md border border-input bg-secondary px-2 text-xs text-foreground"
            value={filters.dateRange.from?.toISOString().split('T')[0] || ''}
            onChange={e => onUpdateFilter('dateRange', { ...filters.dateRange, from: e.target.value ? new Date(e.target.value) : null })}
          />
          <label className="text-xs text-muted-foreground">To</label>
          <input
            type="date"
            className="h-8 rounded-md border border-input bg-secondary px-2 text-xs text-foreground"
            value={filters.dateRange.to?.toISOString().split('T')[0] || ''}
            onChange={e => onUpdateFilter('dateRange', { ...filters.dateRange, to: e.target.value ? new Date(e.target.value) : null })}
          />
        </div>

        <Select value={filters.symbol} onValueChange={v => onUpdateFilter('symbol', v)}>
          <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {symbols.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.marketType} onValueChange={v => onUpdateFilter('marketType', v as AnalyticsFilters['marketType'])}>
          <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            <SelectItem value="spot">Spot</SelectItem>
            <SelectItem value="perpetual">Perpetual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.side} onValueChange={v => onUpdateFilter('side', v as AnalyticsFilters['side'])}>
          <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sides</SelectItem>
            <SelectItem value="long">Long</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs h-8">Reset</Button>
        <Badge variant="secondary" className="ml-auto font-mono">{tradeCount} trades</Badge>
      </div>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trade } from '@/lib/types';
import { calcSessionStats, formatCurrency } from '@/lib/analytics';
import { useMemo } from 'react';

export default function SessionCards({ trades }: { trades: Trade[] }) {
  const sessions = useMemo(() => calcSessionStats(trades), [trades]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {sessions.map(s => (
        <Card key={s.name}>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{s.emoji}</span> {s.name}
              <span className="text-[10px] text-muted-foreground font-normal ml-auto">{s.hours}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Trades</span>
              <span className="font-mono">{s.trades}</span>
            </div>
            <div className="flex justify-between text-xs items-center gap-2">
              <span className="text-muted-foreground">Win Rate</span>
              <Progress value={s.winRate} className="h-1.5 w-16" />
              <span className="font-mono">{s.winRate.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg PnL</span>
              <span className={`font-mono ${s.avgPnl >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(s.avgPnl)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total PnL</span>
              <span className={`font-mono ${s.totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(s.totalPnl)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

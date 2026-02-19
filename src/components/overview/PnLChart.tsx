import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/types';
import { calcCumulativePnL, calcDrawdown, formatCurrency } from '@/lib/analytics';
import { useMemo, useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';

interface PnLChartProps {
  trades: Trade[];
}

export default function PnLChart({ trades }: PnLChartProps) {
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | 'ALL'>('ALL');

  const data = useMemo(() => {
    const cum = calcCumulativePnL(trades);
    const dd = calcDrawdown(trades);
    const now = Date.now();
    const cutoff = period === '7D' ? 7 : period === '30D' ? 30 : period === '90D' ? 90 : Infinity;
    const minDate = cutoff === Infinity ? 0 : now - cutoff * 86400000;

    return cum
      .filter(c => c.date.getTime() > minDate)
      .map((c, i) => ({
        date: c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pnl: c.pnl,
        drawdown: dd[i]?.drawdown || 0,
      }));
  }, [trades, period]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Cumulative PnL & Drawdown</CardTitle>
        <div className="flex gap-1">
          {(['7D', '30D', '90D', 'ALL'] as const).map(p => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }} tickFormatter={v => formatCurrency(v)} />
            <ReferenceLine y={0} stroke="hsl(220 13% 18%)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(220 14% 8%)', border: '1px solid hsl(220 13% 18%)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'hsl(220 10% 55%)' }}
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'pnl' ? 'PnL' : 'Drawdown']}
            />
            <Area type="monotone" dataKey="drawdown" fill="hsl(348 100% 65% / 0.15)" stroke="transparent" />
            <Line type="monotone" dataKey="pnl" stroke="#00d4aa" dot={false} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/types';
import { calcLongShortRatio, calcTotalPnL, calcWinRate } from '@/lib/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/analytics';

export default function LongShortDonut({ trades }: { trades: Trade[] }) {
  const ratio = calcLongShortRatio(trades);
  const longs = useMemo(() => trades.filter(t => t.side === 'long' || t.side === 'buy'), [trades]);
  const shorts = useMemo(() => trades.filter(t => t.side === 'short' || t.side === 'sell'), [trades]);

  const data = [
    { name: 'Long', value: ratio.long },
    { name: 'Short', value: ratio.short },
  ];
  const total = ratio.long + ratio.short;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Long/Short Split</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                <Cell fill="#00d4aa" />
                <Cell fill="#ff4d6d" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-profit" />
                <span className="text-muted-foreground">Long</span>
                <span className="font-mono ml-auto">{total > 0 ? ((ratio.long / total) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PnL: <span className={calcTotalPnL(longs) >= 0 ? 'text-profit' : 'text-loss'}>{formatCurrency(calcTotalPnL(longs))}</span></span>
                <span>WR: {calcWinRate(longs).toFixed(0)}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-loss" />
                <span className="text-muted-foreground">Short</span>
                <span className="font-mono ml-auto">{total > 0 ? ((ratio.short / total) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PnL: <span className={calcTotalPnL(shorts) >= 0 ? 'text-profit' : 'text-loss'}>{formatCurrency(calcTotalPnL(shorts))}</span></span>
                <span>WR: {calcWinRate(shorts).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/types';
import { calcDailyPnL, formatCurrency } from '@/lib/analytics';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export default function DailyPnLChart({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => calcDailyPnL(trades).slice(-30), [trades]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Daily PnL</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(220 10% 55%)' }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }} tickFormatter={v => formatCurrency(v)} />
            <ReferenceLine y={0} stroke="hsl(220 13% 18%)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(220 14% 8%)', border: '1px solid hsl(220 13% 18%)', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [formatCurrency(value), 'PnL']}
            />
            <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? '#00d4aa' : '#ff4d6d'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

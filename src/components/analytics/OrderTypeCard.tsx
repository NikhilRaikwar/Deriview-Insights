
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trade } from '@/lib/types';
import { calcWinRate, calcTotalPnL, formatCurrency } from '@/lib/analytics';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OrderStat {
    type: string;
    count: number;
    winRate: number;
    avgPnl: number;
    totalPnl: number;
}

export default function OrderTypeCard({ trades }: { trades: Trade[] }) {
    const stats = useMemo(() => {
        const types = ['market', 'limit', 'stop'] as const;
        return types.map(t => {
            const subset = trades.filter(tr => tr.orderType === t);
            return {
                type: t.charAt(0).toUpperCase() + t.slice(1),
                count: subset.length,
                winRate: calcWinRate(subset),
                avgPnl: subset.length ? calcTotalPnL(subset) / subset.length : 0,
                totalPnl: calcTotalPnL(subset),
            };
        }).filter(s => s.count > 0);
    }, [trades]);

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance by Order Type</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="type" type="category" width={60} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'hsl(220 14% 8%)', border: '1px solid hsl(220 13% 18%)', borderRadius: 8, fontSize: 12 }}
                                    formatter={(v: number, name: string) => [
                                        name === 'winRate' ? `${v.toFixed(1)}%` : formatCurrency(v),
                                        name === 'winRate' ? 'Win Rate' : 'Total PnL'
                                    ]}
                                />
                                <Bar dataKey="totalPnl" radius={[0, 4, 4, 0]} barSize={20}>
                                    {stats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? '#00d4aa' : '#ff4d6d'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                        {stats.map(s => (
                            <div key={s.type} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 w-24">
                                    <span className="font-medium">{s.type}</span>
                                    <span className="text-muted-foreground">({s.count})</span>
                                </div>
                                <div className="flex-1 flex justify-end gap-4">
                                    <div className="text-right w-16">
                                        <span className="block text-muted-foreground text-[10px]">Win Rate</span>
                                        <span className="font-mono">{s.winRate.toFixed(0)}%</span>
                                    </div>
                                    <div className="text-right w-20">
                                        <span className="block text-muted-foreground text-[10px]">Avg PnL</span>
                                        <span className={`font-mono ${s.avgPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                                            {formatCurrency(s.avgPnl)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

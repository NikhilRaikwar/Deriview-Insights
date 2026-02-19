import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/lib/types';
import { calcFeeBreakdown, calcSymbolStats, calcTotalPnL, formatCurrency } from '@/lib/analytics';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from 'recharts';

export default function FeesTab({ trades }: { trades: Trade[] }) {
  const breakdown = useMemo(() => calcFeeBreakdown(trades), [trades]);
  const totalPnl = calcTotalPnL(trades);
  const grossProfits = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const avgFee = trades.length ? breakdown.total / trades.length : 0;
  const symbolStats = useMemo(() => calcSymbolStats(trades), [trades]);

  const pieData = [
    { name: 'Maker', value: breakdown.maker },
    { name: 'Taker', value: breakdown.taker },
    { name: 'Funding', value: breakdown.funding },
  ].filter(d => d.value > 0);

  const cumFees = useMemo(() => {
    const sorted = [...trades].sort((a, b) => a.exitTime - b.exitTime);
    let total = 0, maker = 0, taker = 0;
    return sorted.map(t => {
      total += t.fees;
      maker += t.makerFees;
      taker += t.takerFees;
      return {
        date: new Date(t.exitTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total, maker, taker,
      };
    });
  }, [trades]);

  return (
    <div className="space-y-4">
      {/* Cumulative Fees */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cumulative Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumFees}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220 10% 55%)' }} tickFormatter={v => formatCurrency(v)} />
              <RTooltip contentStyle={{ backgroundColor: 'hsl(220 14% 8%)', border: '1px solid hsl(220 13% 18%)', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="total" fill="hsl(38 92% 50% / 0.15)" stroke="#f59e0b" strokeWidth={2} />
              <Area type="monotone" dataKey="taker" fill="hsl(348 100% 65% / 0.1)" stroke="#ff4d6d" strokeWidth={1} />
              <Area type="monotone" dataKey="maker" fill="hsl(165 100% 42% / 0.1)" stroke="#00d4aa" strokeWidth={1} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fee Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                  <Cell fill="#00d4aa" />
                  <Cell fill="#ff4d6d" />
                  <Cell fill="#3d7fff" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-profit" /><span>Maker: {formatCurrency(breakdown.maker)}</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-loss" /><span>Taker: {formatCurrency(breakdown.taker)}</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: '#3d7fff' }} /><span>Funding: {formatCurrency(breakdown.funding)}</span></div>
              <div className="pt-1 border-t border-border font-medium">Total: {formatCurrency(breakdown.total)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Fee by symbol */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fees by Symbol</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Symbol</TableHead>
                  <TableHead className="text-xs">Fees</TableHead>
                  <TableHead className="text-xs">% of PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {symbolStats.map(s => (
                  <TableRow key={s.symbol} className="text-xs font-mono">
                    <TableCell className="font-sans">{s.symbol}</TableCell>
                    <TableCell className="text-fees">{formatCurrency(s.fees)}</TableCell>
                    <TableCell>{s.totalPnl !== 0 ? ((s.fees / Math.abs(s.totalPnl)) * 100).toFixed(1) : '—'}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Fee/Profit Ratio</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-2xl font-bold font-mono text-fees">
              {grossProfits > 0 ? ((breakdown.total / grossProfits) * 100).toFixed(1) : '—'}%
            </span>
            <p className="text-[10px] text-muted-foreground mt-1">of gross profits paid in fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Avg Fee/Trade</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-2xl font-bold font-mono text-fees">{formatCurrency(avgFee)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Net After Fees</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className={`text-2xl font-bold font-mono ${totalPnl - breakdown.total >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(totalPnl - breakdown.total)}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

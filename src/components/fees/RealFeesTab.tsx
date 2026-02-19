import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DeriverseData } from '@/lib/deriverse';
import { formatCurrency } from '@/lib/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#00d4aa', '#ff4d6d', '#3d7fff', '#f59e0b'];

export default function RealFeesTab({ data }: { data: DeriverseData }) {
  const netFees = data.totalFees - data.totalRebates;
  const grossProfit = data.totalRealizedPnl > 0 ? data.totalRealizedPnl : 0;
  const feeRatio = grossProfit > 0 ? (data.totalFees / grossProfit) * 100 : 0;

  const pieData = [
    { name: 'Trading Fees', value: data.totalFees },
    { name: 'Rebates', value: data.totalRebates },
    { name: 'Funding', value: Math.abs(data.totalFundingPaid) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Fee KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Total Fees</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-2xl font-bold font-mono text-fees">{formatCurrency(data.totalFees)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Rebates Earned</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-2xl font-bold font-mono text-profit">{formatCurrency(data.totalRebates)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Net Fees</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-2xl font-bold font-mono text-fees">{formatCurrency(netFees)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-normal">Fee/Profit Ratio</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-2xl font-bold font-mono text-fees">
              {feeRatio > 0 ? `${feeRatio.toFixed(1)}%` : '—'}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fee Breakdown Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fee Composition</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" stroke="none">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-xs">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="font-mono ml-auto">{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm py-4">No fee data available</p>
            )}
          </CardContent>
        </Card>

        {/* Per-Position Fees */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fees by Position</CardTitle>
          </CardHeader>
          <CardContent>
            {data.perpPositions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No positions</p>
            ) : (
              <div className="space-y-3">
                {data.perpPositions.map(p => (
                  <div key={p.instrId} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{p.symbol}</span>
                    <div className="flex gap-3 font-mono">
                      <span className="text-fees">Fees: {formatCurrency(p.fees)}</span>
                      <span className="text-profit">Reb: {formatCurrency(p.rebates)}</span>
                      <span className={p.fundingFunds >= 0 ? 'text-loss' : 'text-profit'}>
                        Fund: {formatCurrency(Math.abs(p.fundingFunds))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funding Impact */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Funding Rate Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Funding</p>
              <span className={`text-xl font-bold font-mono ${data.totalFundingPaid >= 0 ? 'text-loss' : 'text-profit'}`}>
                {formatCurrency(Math.abs(data.totalFundingPaid))}
              </span>
              <p className="text-[10px] text-muted-foreground">{data.totalFundingPaid >= 0 ? 'Paid' : 'Received'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Impact on PnL</p>
              <span className="text-xl font-bold font-mono text-foreground">
                {data.totalRealizedPnl !== 0 ? ((Math.abs(data.totalFundingPaid) / Math.abs(data.totalRealizedPnl)) * 100).toFixed(1) : '—'}%
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Socialized Losses</p>
              <span className="text-xl font-bold font-mono text-loss">
                {formatCurrency(data.perpPositions.reduce((s, p) => s + p.socLossFunds, 0))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

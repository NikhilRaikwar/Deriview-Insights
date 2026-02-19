import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DeriverseData } from '@/lib/deriverse';
import { formatCurrency } from '@/lib/analytics';

interface Props {
  data: DeriverseData;
}

export default function AccountKPIs({ data }: Props) {
  const netPnl = data.totalRealizedPnl - data.totalFees + data.totalRebates;
  const totalTrades = data.totalSpotTrades + data.totalPerpTrades;
  const totalUnrealizedPnl = data.perpPositions.reduce((s, p) => s + p.unrealizedPnl, 0);
  const totalMargin = data.perpPositions.reduce((s, p) => s + p.funds, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* Realized PnL */}
      <Card className={data.totalRealizedPnl >= 0 ? 'glow-profit' : 'glow-loss'}>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Realized PnL</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className={`text-2xl font-bold font-mono ${data.totalRealizedPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatCurrency(data.totalRealizedPnl)}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1">From perp positions</p>
        </CardContent>
      </Card>

      {/* Unrealized PnL */}
      <Card className={totalUnrealizedPnl >= 0 ? 'glow-profit' : 'glow-loss'}>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Unrealized PnL</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className={`text-2xl font-bold font-mono ${totalUnrealizedPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatCurrency(totalUnrealizedPnl)}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1">{data.perpPositions.length} open positions</p>
        </CardContent>
      </Card>

      {/* Net PnL (after fees) */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Net PnL (after fees)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className={`text-2xl font-bold font-mono ${netPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatCurrency(netPnl)}
          </span>
        </CardContent>
      </Card>

      {/* Total Fees */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Fees Paid</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-fees">{formatCurrency(data.totalFees)}</span>
          {data.totalRebates > 0 && (
            <Badge variant="secondary" className="ml-2 text-[10px] text-profit">
              -{formatCurrency(data.totalRebates)} rebates
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Total Trades */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">All-Time Trades</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-foreground">{totalTrades}</span>
          <div className="flex gap-1 mt-1">
            <Badge variant="secondary" className="text-[10px]">Spot: {data.totalSpotTrades}</Badge>
            <Badge variant="secondary" className="text-[10px]">Perp: {data.totalPerpTrades}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Funding Paid */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Funding Payments</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className={`text-2xl font-bold font-mono ${data.totalFundingPaid >= 0 ? 'text-loss' : 'text-profit'}`}>
            {formatCurrency(Math.abs(data.totalFundingPaid))}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1">
            {data.totalFundingPaid >= 0 ? 'Paid' : 'Received'}
          </p>
        </CardContent>
      </Card>

      {/* Margin Used */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Margin</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-volume">{formatCurrency(totalMargin)}</span>
        </CardContent>
      </Card>

      {/* Points */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Points</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-foreground">{data.points.toLocaleString()}</span>
          <p className="text-[10px] text-muted-foreground mt-1">Airdrop eligibility</p>
        </CardContent>
      </Card>
    </div>
  );
}

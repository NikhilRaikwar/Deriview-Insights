import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trade } from '@/lib/types';
import {
  calcTotalPnL, calcWinRate, calcTotalVolume, calcTotalFees,
  calcAvgDuration, calcLargestGain, calcLargestLoss,
  formatCurrency, formatDuration, calcLongShortRatio
} from '@/lib/analytics';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { calcCumulativePnL } from '@/lib/analytics';
import { useMemo } from 'react';

interface KPICardsProps {
  trades: Trade[];
}

export default function KPICards({ trades }: KPICardsProps) {
  const totalPnl = calcTotalPnL(trades);
  const winRate = calcWinRate(trades);
  const volume = calcTotalVolume(trades);
  const fees = calcTotalFees(trades);
  const avgDur = calcAvgDuration(trades);
  const largest = calcLargestGain(trades);
  const worstTrade = calcLargestLoss(trades);
  const ratio = calcLongShortRatio(trades);
  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl <= 0).length;
  const sparkData = useMemo(() => calcCumulativePnL(trades).slice(-30), [trades]);
  const spotVol = trades.filter(t => t.marketType === 'spot').reduce((s, t) => s + t.size, 0);
  const spotPct = volume > 0 ? (spotVol / volume) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* Total PnL */}
      <Card className={totalPnl >= 0 ? 'glow-profit' : 'glow-loss'}>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total PnL</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className={`text-2xl font-bold font-mono ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {formatCurrency(totalPnl)}
          </span>
          <div className="h-10 mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="pnl" stroke={totalPnl >= 0 ? '#00d4aa' : '#ff4d6d'} dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Win Rate</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-foreground">{winRate.toFixed(1)}%</span>
          <p className="text-xs text-muted-foreground mt-1">{wins}W / {losses}L</p>
          <Progress value={winRate} className="h-1.5 mt-2" />
        </CardContent>
      </Card>

      {/* Volume */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Volume</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-foreground">{formatCurrency(volume)}</span>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={spotPct} className="h-1.5 flex-1" />
            <span className="text-[10px] text-muted-foreground">{spotPct.toFixed(0)}% spot</span>
          </div>
        </CardContent>
      </Card>

      {/* Fees */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Fees</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-fees">{formatCurrency(fees)}</span>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {volume > 0 ? ((fees / volume) * 100).toFixed(2) : 0}% of volume
          </Badge>
        </CardContent>
      </Card>

      {/* Total Trades */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Trades</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-foreground">{trades.length}</span>
          <div className="flex gap-1 mt-1">
            <Badge variant="secondary" className="text-[10px]">L:{ratio.long}</Badge>
            <Badge variant="secondary" className="text-[10px]">S:{ratio.short}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Avg Duration */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Avg Duration</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <span className="text-2xl font-bold font-mono text-foreground">{formatDuration(avgDur)}</span>
        </CardContent>
      </Card>

      {/* Largest Gain */}
      <Card className="glow-profit">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Largest Gain</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {largest ? (
            <>
              <span className="text-2xl font-bold font-mono text-profit">{formatCurrency(largest.pnl)}</span>
              <Badge variant="secondary" className="ml-2 text-[10px]">{largest.symbol}</Badge>
            </>
          ) : <span className="text-muted-foreground">—</span>}
        </CardContent>
      </Card>

      {/* Largest Loss */}
      <Card className="glow-loss">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs text-muted-foreground font-normal">Largest Loss</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {worstTrade ? (
            <>
              <span className="text-2xl font-bold font-mono text-loss">{formatCurrency(worstTrade.pnl)}</span>
              <Badge variant="secondary" className="ml-2 text-[10px]">{worstTrade.symbol}</Badge>
            </>
          ) : <span className="text-muted-foreground">—</span>}
        </CardContent>
      </Card>
    </div>
  );
}

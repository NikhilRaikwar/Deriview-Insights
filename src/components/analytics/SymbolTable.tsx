import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Trade } from '@/lib/types';
import { calcSymbolStats, formatCurrency } from '@/lib/analytics';
import { useMemo } from 'react';

export default function SymbolTable({ trades }: { trades: Trade[] }) {
  const stats = useMemo(() => calcSymbolStats(trades), [trades]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Symbol Performance</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Symbol</TableHead>
              <TableHead className="text-xs">Trades</TableHead>
              <TableHead className="text-xs">Win Rate</TableHead>
              <TableHead className="text-xs">Total PnL</TableHead>
              <TableHead className="text-xs">Avg PnL</TableHead>
              <TableHead className="text-xs">Volume</TableHead>
              <TableHead className="text-xs">Fees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(s => (
              <TableRow key={s.symbol} className="text-xs font-mono">
                <TableCell className="font-sans font-medium">{s.symbol}</TableCell>
                <TableCell>{s.trades}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={s.winRate} className="h-1.5 w-12" />
                    <span>{s.winRate.toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell className={s.totalPnl >= 0 ? 'text-profit' : 'text-loss'}>{formatCurrency(s.totalPnl)}</TableCell>
                <TableCell className={s.avgPnl >= 0 ? 'text-profit' : 'text-loss'}>{formatCurrency(s.avgPnl)}</TableCell>
                <TableCell>{formatCurrency(s.volume)}</TableCell>
                <TableCell className="text-fees">{formatCurrency(s.fees)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

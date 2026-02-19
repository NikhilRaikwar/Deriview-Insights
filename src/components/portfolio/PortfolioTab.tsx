import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OpenPosition, SpotBalance } from '@/lib/types';
import { formatCurrency } from '@/lib/analytics';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#00d4aa', '#3d7fff', '#f59e0b', '#ff4d6d', '#a855f7', '#6b7280'];

interface Props {
  positions: OpenPosition[];
  balances: SpotBalance[];
}

export default function PortfolioTab({ positions, balances }: Props) {
  const totalValue = balances.reduce((s, b) => s + b.usdValue, 0);
  const pieData = balances.map(b => ({ name: b.symbol, value: b.usdValue }));

  return (
    <div className="space-y-4">
      {/* Open Positions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Open Positions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No open positions</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Symbol</TableHead>
                  <TableHead className="text-xs">Side</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Entry</TableHead>
                  <TableHead className="text-xs">Mark</TableHead>
                  <TableHead className="text-xs">Unr. PnL</TableHead>
                  <TableHead className="text-xs">Liq. Price</TableHead>
                  <TableHead className="text-xs">Leverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((p, i) => (
                  <TableRow key={i} className="text-xs font-mono">
                    <TableCell className="font-sans font-medium">{p.symbol}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${p.side === 'long' ? 'bg-profit text-primary-foreground' : 'bg-loss text-foreground'}`}>
                        {p.side.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(p.size)}</TableCell>
                    <TableCell>${p.entryPrice.toFixed(2)}</TableCell>
                    <TableCell>${p.markPrice.toFixed(2)}</TableCell>
                    <TableCell className={p.unrealizedPnl >= 0 ? 'text-profit' : 'text-loss'}>
                      {formatCurrency(p.unrealizedPnl)}
                      <span className="text-muted-foreground ml-1">({p.unrealizedPnlPercent >= 0 ? '+' : ''}{p.unrealizedPnlPercent.toFixed(2)}%)</span>
                    </TableCell>
                    <TableCell className="text-loss">${p.liquidationPrice.toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.leverage}x</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spot Balances */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Spot Balances
              <span className="ml-2 text-xs text-muted-foreground font-normal">{formatCurrency(totalValue)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {balances.map(b => (
                <Card key={b.symbol} className="p-3">
                  <p className="text-lg font-bold font-mono">{b.symbol}</p>
                  <p className="text-xs text-muted-foreground">{b.balance.toLocaleString()} tokens</p>
                  <p className="text-sm font-mono mt-1">{formatCurrency(b.usdValue)}</p>
                  <Badge variant="secondary" className={`text-[10px] mt-1 ${b.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {b.change24h >= 0 ? '+' : ''}{b.change24h.toFixed(1)}%
                  </Badge>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Composition */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Portfolio Composition</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {balances.map((b, i) => (
                <div key={b.symbol} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{b.symbol}</span>
                  <span className="ml-auto font-mono text-muted-foreground">{totalValue > 0 ? ((b.usdValue / totalValue) * 100).toFixed(1) : 0}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

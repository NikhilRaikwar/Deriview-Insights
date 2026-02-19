import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PerpPosition, SpotOrdersInfo, ClientBalance } from '@/lib/deriverse';
import { formatCurrency } from '@/lib/analytics';

interface Props {
  perpPositions: PerpPosition[];
  spotOrders: SpotOrdersInfo[];
  balances: ClientBalance[];
}

export default function RealPortfolioTab({ perpPositions, spotOrders, balances }: Props) {
  const totalBalance = balances.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-4">
      {/* Token Balances */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Deriverse Account Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No balances found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {balances.map(b => (
                <Card key={b.tokenId} className="p-3">
                  <p className="text-lg font-bold font-mono">{b.symbol}</p>
                  <p className="text-sm font-mono text-foreground">{b.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Token ID: {b.tokenId}</p>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Perp Positions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Open Perpetual Positions
            <Badge variant="secondary" className="ml-2 text-[10px]">{perpPositions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {perpPositions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No open perp positions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pair</TableHead>
                  <TableHead className="text-xs">Side</TableHead>
                  <TableHead className="text-xs">Size</TableHead>
                  <TableHead className="text-xs">Margin</TableHead>
                  <TableHead className="text-xs">Leverage</TableHead>
                  <TableHead className="text-xs">Mark Price</TableHead>
                  <TableHead className="text-xs">Unr. PnL</TableHead>
                  <TableHead className="text-xs">Real. PnL</TableHead>
                  <TableHead className="text-xs">Fees</TableHead>
                  <TableHead className="text-xs">Funding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perpPositions.map(p => {
                  const isLong = p.perps > 0;
                  return (
                    <TableRow key={p.instrId} className="text-xs font-mono">
                      <TableCell className="font-sans font-medium">{p.symbol}</TableCell>
                      <TableCell>
                        {p.perps !== 0 ? (
                          <Badge className={`text-[10px] ${isLong ? 'bg-profit text-primary-foreground' : 'bg-loss text-foreground'}`}>
                            {isLong ? 'LONG' : 'SHORT'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{Math.abs(p.perps).toFixed(4)}</TableCell>
                      <TableCell>{formatCurrency(p.funds)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.leverage}x</Badge></TableCell>
                      <TableCell>{formatCurrency(p.markPrice)}</TableCell>
                      <TableCell className={p.unrealizedPnl >= 0 ? 'text-profit' : 'text-loss'}>
                        {formatCurrency(p.unrealizedPnl)}
                      </TableCell>
                      <TableCell className={p.result >= 0 ? 'text-profit' : 'text-loss'}>
                        {formatCurrency(p.result)}
                      </TableCell>
                      <TableCell className="text-fees">{formatCurrency(p.fees)}</TableCell>
                      <TableCell className={p.fundingFunds >= 0 ? 'text-loss' : 'text-profit'}>
                        {formatCurrency(Math.abs(p.fundingFunds))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Perp Position Details */}
      {perpPositions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {perpPositions.map(p => (
            <Card key={`detail-${p.instrId}`}>
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm">{p.symbol} Position Detail</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position Cost</span>
                  <span className="font-mono">{formatCurrency(p.cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Orders (Perps)</span>
                  <span className="font-mono">{p.inOrdersPerps.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Orders (Funds)</span>
                  <span className="font-mono">{formatCurrency(p.inOrdersFunds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rebates</span>
                  <span className="font-mono text-profit">{formatCurrency(p.rebates)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soc. Loss</span>
                  <span className="font-mono text-loss">{formatCurrency(p.socLossFunds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loss Coverage</span>
                  <span className="font-mono">{formatCurrency(p.lossCoverage)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Open Spot Orders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Spot Orders Activity
            <Badge variant="secondary" className="ml-2 text-[10px]">{spotOrders.length} instruments</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {spotOrders.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No spot order activity</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pair</TableHead>
                  <TableHead className="text-xs">Open Bids</TableHead>
                  <TableHead className="text-xs">Open Asks</TableHead>
                  <TableHead className="text-xs">In Orders (Asset)</TableHead>
                  <TableHead className="text-xs">In Orders (Currency)</TableHead>
                  <TableHead className="text-xs">Available (Asset)</TableHead>
                  <TableHead className="text-xs">Available (Currency)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spotOrders.map(o => (
                  <TableRow key={o.instrId} className="text-xs font-mono">
                    <TableCell className="font-sans font-medium">{o.symbol}</TableCell>
                    <TableCell>{o.bidsCount}</TableCell>
                    <TableCell>{o.asksCount}</TableCell>
                    <TableCell>{o.inOrdersAssetTokens.toFixed(4)}</TableCell>
                    <TableCell>{formatCurrency(o.inOrdersCrncyTokens)}</TableCell>
                    <TableCell>{o.tempAssetTokens.toFixed(4)}</TableCell>
                    <TableCell>{formatCurrency(o.tempCrncyTokens)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

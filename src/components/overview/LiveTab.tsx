import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/analytics';
import type { DeriverseData } from '@/lib/deriverse';
import AccountKPIs from './AccountKPIs';
import RealPortfolioTab from '@/components/portfolio/RealPortfolioTab';
import OrderBook from './OrderBook';
import { Radio, Wallet, ArrowUpRight, TrendingUp, AlertTriangle } from 'lucide-react';

interface LiveTabProps {
    data: DeriverseData;
    isClientLoaded: boolean;
}

export default function LiveTab({ data, isClientLoaded }: LiveTabProps) {
    // Find the most active instrument for Order Book display (by volume/trades)
    const activeInstrument = React.useMemo(() => {
        return [...data.instruments].sort((a, b) => b.perpDayVolume - a.perpDayVolume)[0];
    }, [data.instruments]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Header Badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-profit/10 text-profit border-profit/30 px-3 py-1 flex items-center gap-2">
                        <Radio className="w-3 h-3 animate-pulse" />
                        LIVE CHAIN DATA
                    </Badge>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Solana Devnet / Mainnet</span>
                </div>
                {isClientLoaded && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Connected
                    </Badge>
                )}
            </div>

            {/* Account KPIs (Only if client loaded) */}
            {isClientLoaded && (
                <AccountKPIs data={data} />
            )}

            {/* Live Order Book & Market Depth */}
            {activeInstrument && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <OrderBook
                        symbol={`${activeInstrument.assetSymbol}/${activeInstrument.crncySymbol}`}
                        type="PERP"
                        bids={activeInstrument.perpBids}
                        asks={activeInstrument.perpAsks}
                    />
                    <OrderBook
                        symbol={`${activeInstrument.assetSymbol}/${activeInstrument.crncySymbol}`}
                        type="SPOT"
                        bids={activeInstrument.spotBids}
                        asks={activeInstrument.spotAsks}
                    />
                </div>
            )}

            {/* Portfolio & Balances (Only if client loaded) */}
            {isClientLoaded && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <RealPortfolioTab
                            perpPositions={data.perpPositions}
                            spotOrders={data.spotOrders}
                            balances={data.balances}
                        />
                    </div>

                    <div className="space-y-4">
                        {/* Token Balances Card */}
                        <Card>
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm">Wallet Balances</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableBody>
                                        {data.balances.map((bal) => (
                                            <TableRow key={`${bal.mint}-${bal.tokenId}`}>
                                                <TableCell className="font-medium">{bal.symbol}</TableCell>
                                                <TableCell className="text-right font-mono">{formatCurrency(bal.amount)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {data.balances.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="text-center text-muted-foreground py-4 text-xs">
                                                    No tokens found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Trade Counts Stats */}
                        <Card>
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm">Lifetime Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Total Spot Trades</span>
                                    <span className="font-mono text-sm">{data.totalSpotTrades}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Total Perp Trades</span>
                                    <span className="font-mono text-sm">{data.totalPerpTrades}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-profit" /> Points Score
                                    </span>
                                    <span className="font-mono text-sm font-bold text-foreground">{data.points.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {!isClientLoaded && (
                <Card className="bg-secondary/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        {data.instruments.length === 0 ? (
                            <>
                                <AlertTriangle className="w-8 h-8 mb-3 text-destructive opacity-80" />
                                <p className="text-sm font-medium text-destructive">Connection Failed</p>
                                <p className="text-xs mt-1 max-w-xs mx-auto">
                                    Unable to load live market data from Solana protocol.
                                    Please check your connection or try again later.
                                </p>
                            </>
                        ) : (
                            <>
                                <Wallet className="w-8 h-8 mb-3 opacity-50" />
                                <p className="text-sm">Connect a wallet above to view personal account data.</p>
                                <p className="text-xs mt-1">Market data (Order Books) is live for everyone.</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}

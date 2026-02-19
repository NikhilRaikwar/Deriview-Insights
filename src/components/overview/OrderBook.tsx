import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/analytics';

interface OrderBookProps {
    symbol: string;
    type: 'SPOT' | 'PERP';
    bids: { px: number; qty: number }[];
    asks: { px: number; qty: number }[];
}

export default function OrderBook({ symbol, type, bids, asks }: OrderBookProps) {
    // Determine max quantity for depth visualization
    const maxQty = Math.max(
        ...bids.map(b => b.qty),
        ...asks.map(a => a.qty),
        0.0001 // Prevent division by zero
    );

    return (
        <Card className="h-full">
            <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-sm flex items-center justify-between">
                    <span>Live Order Book</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{symbol}</span>
                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-foreground">{type}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="h-8 hover:bg-transparent">
                            <TableHead className="text-[10px] w-1/3 h-8">Bid Size</TableHead>
                            <TableHead className="text-[10px] w-1/3 h-8 text-center">Price</TableHead>
                            <TableHead className="text-[10px] w-1/3 h-8 text-right">Ask Size</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Asks (Sell Orders) - Reverse order to show lowest ask at bottom (closest to spread) */}
                        {asks.slice(0, 8).reverse().map((ask, i) => (
                            <TableRow key={`ask-${i}`} className="h-7 border-0 hover:bg-muted/30">
                                <TableCell className="py-0" />
                                <TableCell className="py-0 text-[11px] font-mono text-center text-loss">
                                    {formatCurrency(ask.px)}
                                </TableCell>
                                <TableCell className="py-0 text-right">
                                    <div className="relative flex justify-end items-center h-6">
                                        <div
                                            className="absolute right-0 top-1 bottom-1 bg-loss/20 rounded-l-sm"
                                            style={{ width: `${Math.min((ask.qty / maxQty) * 100, 100)}%` }}
                                        />
                                        <span className="relative z-10 text-[10px] font-mono pr-1">{ask.qty.toFixed(4)}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Spread Indicator if we have both sides */}
                        {asks.length > 0 && bids.length > 0 && (
                            <TableRow className="h-6 border-y border-border/50 bg-secondary/20 hover:bg-secondary/20">
                                <TableCell colSpan={3} className="py-0 text-center text-[10px] text-muted-foreground font-mono">
                                    Spread: {((asks[0].px - bids[0].px) / bids[0].px * 100).toFixed(3)}%
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Bids (Buy Orders) */}
                        {bids.slice(0, 8).map((bid, i) => (
                            <TableRow key={`bid-${i}`} className="h-7 border-0 hover:bg-muted/30">
                                <TableCell className="py-0">
                                    <div className="relative flex justify-start items-center h-6">
                                        <div
                                            className="absolute left-0 top-1 bottom-1 bg-profit/20 rounded-r-sm"
                                            style={{ width: `${Math.min((bid.qty / maxQty) * 100, 100)}%` }}
                                        />
                                        <span className="relative z-10 text-[10px] font-mono pl-1">{bid.qty.toFixed(4)}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-0 text-[11px] font-mono text-center text-profit">
                                    {formatCurrency(bid.px)}
                                </TableCell>
                                <TableCell className="py-0" />
                            </TableRow>
                        ))}

                        {(bids.length === 0 && asks.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-xs text-muted-foreground h-24">
                                    No orders in book
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

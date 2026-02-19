import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { MarketInstrument } from '@/lib/deriverse';
import { formatCurrency } from '@/lib/analytics';

interface Props {
  instruments: MarketInstrument[];
}

export default function MarketOverview({ instruments }: Props) {
  if (instruments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No instruments found on devnet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instrument Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {instruments.map(instr => (
          <Card key={instr.instrId}>
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{instr.assetSymbol}/{instr.crncySymbol}</span>
                <Badge variant="outline" className="text-[10px]">ID: {instr.instrId}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-3">
              {/* Spot Data */}
              {instr.spotLastPx > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Spot</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-foreground">
                      {formatCurrency(instr.spotLastPx)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bid</span>
                      <span className="font-mono text-profit">{formatCurrency(instr.spotBestBid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ask</span>
                      <span className="font-mono text-loss">{formatCurrency(instr.spotBestAsk)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h High</span>
                      <span className="font-mono">{formatCurrency(instr.spotDayHigh)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Low</span>
                      <span className="font-mono">{formatCurrency(instr.spotDayLow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Trades</span>
                      <span className="font-mono">{instr.spotDayTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">All Trades</span>
                      <span className="font-mono">{instr.spotAlltimeTrades}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Perp Data */}
              {(instr.perpLastPx > 0 || instr.maxLeverage > 0) && (
                <div className={instr.spotLastPx > 0 ? 'pt-2 border-t border-border' : ''}>
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Perpetual
                    {instr.maxLeverage > 0 && (
                      <Badge variant="secondary" className="ml-1 text-[9px]">{instr.maxLeverage}x max</Badge>
                    )}
                  </p>
                  {instr.perpLastPx > 0 && (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-foreground">
                          {formatCurrency(instr.perpLastPx)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bid</span>
                          <span className="font-mono text-profit">{formatCurrency(instr.perpBestBid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ask</span>
                          <span className="font-mono text-loss">{formatCurrency(instr.perpBestAsk)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">OI</span>
                          <span className="font-mono">{formatCurrency(instr.perpOpenInterest)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Funding</span>
                          <span className="font-mono">{(instr.perpFundingRate * 100).toFixed(4)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">24h Trades</span>
                          <span className="font-mono">{instr.perpDayTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Traders</span>
                          <span className="font-mono">{instr.perpClientsCount}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Book Summary */}
      {instruments.filter(i => i.spotBids.length > 0 || i.spotAsks.length > 0).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Order Books</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pair</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Bid Levels</TableHead>
                  <TableHead className="text-xs">Ask Levels</TableHead>
                  <TableHead className="text-xs">Best Bid</TableHead>
                  <TableHead className="text-xs">Best Ask</TableHead>
                  <TableHead className="text-xs">Spread</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instruments.map(instr => (
                  <React.Fragment key={instr.instrId}>
                    {instr.spotBestBid > 0 && (
                      <TableRow key={`spot-${instr.instrId}`} className="text-xs font-mono">
                        <TableCell className="font-sans">{instr.assetSymbol}/{instr.crncySymbol}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">SPOT</Badge></TableCell>
                        <TableCell>{instr.spotBids.length}</TableCell>
                        <TableCell>{instr.spotAsks.length}</TableCell>
                        <TableCell className="text-profit">{formatCurrency(instr.spotBestBid)}</TableCell>
                        <TableCell className="text-loss">{formatCurrency(instr.spotBestAsk)}</TableCell>
                        <TableCell>
                          {instr.spotBestBid > 0 ? ((instr.spotBestAsk - instr.spotBestBid) / instr.spotBestBid * 100).toFixed(3) : '—'}%
                        </TableCell>
                      </TableRow>
                    )}
                    {instr.perpBestBid > 0 && (
                      <TableRow key={`perp-${instr.instrId}`} className="text-xs font-mono">
                        <TableCell className="font-sans">{instr.assetSymbol}/{instr.crncySymbol}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[9px]">PERP</Badge></TableCell>
                        <TableCell>{instr.perpBids.length}</TableCell>
                        <TableCell>{instr.perpAsks.length}</TableCell>
                        <TableCell className="text-profit">{formatCurrency(instr.perpBestBid)}</TableCell>
                        <TableCell className="text-loss">{formatCurrency(instr.perpBestAsk)}</TableCell>
                        <TableCell>
                          {instr.perpBestBid > 0 ? ((instr.perpBestAsk - instr.perpBestBid) / instr.perpBestBid * 100).toFixed(3) : '—'}%
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

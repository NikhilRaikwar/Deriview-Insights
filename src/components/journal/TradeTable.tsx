import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trade } from '@/lib/types';
import { formatCurrency, formatDuration } from '@/lib/analytics';
import { ChevronDown, ChevronUp, MessageSquare, Plus, Download } from 'lucide-react';
import AnnotationModal from './AnnotationModal';

export default function TradeTable({ trades }: { trades: Trade[] }) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<keyof Trade>('exitTime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [annotatingTrade, setAnnotatingTrade] = useState<Trade | null>(null);
  const perPage = 25;

  const sorted = useMemo(() => {
    return [...trades].sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [trades, sortKey, sortDir]);

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(trades.length / perPage);

  const toggleSort = (key: keyof Trade) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const headers = ['Symbol', 'Market', 'Side', 'Entry', 'Exit', 'Size', 'PnL', 'PnL%', 'Fees', 'Duration', 'Notes'];
    const rows = trades.map(t => [t.symbol, t.marketType, t.side, t.entryPrice.toFixed(2), t.exitPrice.toFixed(2), t.size.toFixed(2), t.pnl.toFixed(2), t.pnlPercent.toFixed(2), t.fees.toFixed(2), formatDuration(t.duration), t.notes || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades.csv';
    a.click();
  };

  const SortHeader = ({ label, field }: { label: string; field: keyof Trade }) => (
    <TableHead className="cursor-pointer select-none text-xs hover:text-foreground" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">
        {label}
        {sortKey === field && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </div>
    </TableHead>
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Trade Journal</CardTitle>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={exportCSV}>
            <Download className="w-3 h-3 mr-1" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8">#</TableHead>
                  <SortHeader label="Symbol" field="symbol" />
                  <SortHeader label="Side" field="side" />
                  <SortHeader label="Entry" field="entryPrice" />
                  <SortHeader label="Exit" field="exitPrice" />
                  <SortHeader label="Size" field="size" />
                  <SortHeader label="PnL" field="pnl" />
                  <SortHeader label="PnL%" field="pnlPercent" />
                  <SortHeader label="Fees" field="fees" />
                  <SortHeader label="Duration" field="duration" />
                  <TableHead className="text-xs">Notes</TableHead>
                  <TableHead className="text-xs w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((t, i) => (
                  <React.Fragment key={t.id}>
                    <TableRow className="text-xs font-mono hover:bg-secondary/50">
                      <TableCell className="text-muted-foreground">{page * perPage + i + 1}</TableCell>
                      <TableCell>
                        <span>{t.symbol}</span>
                        <Badge variant="outline" className="ml-1 text-[9px] px-1">{t.marketType === 'perpetual' ? 'PERP' : 'SPOT'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${t.side === 'long' || t.side === 'buy' ? 'bg-profit text-primary-foreground' : 'bg-loss text-foreground'}`}>
                          {t.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${t.entryPrice.toFixed(2)}</TableCell>
                      <TableCell>${t.exitPrice.toFixed(2)}</TableCell>
                      <TableCell>{formatCurrency(t.size)}</TableCell>
                      <TableCell className={t.pnl >= 0 ? 'text-profit' : 'text-loss'}>{formatCurrency(t.pnl)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${t.pnlPercent >= 0 ? 'text-profit border-chart-profit/30' : 'text-loss border-destructive/30'}`}>
                          {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-fees">{formatCurrency(t.fees)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDuration(t.duration)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setAnnotatingTrade(t)}>
                          {t.notes ? <MessageSquare className="w-3 h-3 text-accent" /> : <Plus className="w-3 h-3 text-muted-foreground" />}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                          <ChevronDown className={`w-3 h-3 transition-transform ${expandedId === t.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedId === t.id && (
                      <TableRow key={`${t.id}-expanded`}>
                        <TableCell colSpan={12} className="bg-secondary/30 p-3">
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1">Entry Details</p>
                              <p>Order: {t.orderType} {t.leverage && `• ${t.leverage}x`}</p>
                              <p>Time: {new Date(t.entryTime * 1000).toLocaleString()}</p>
                              {t.margin && <p>Margin: {formatCurrency(t.margin)}</p>}
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Exit Details</p>
                              <p>Time: {new Date(t.exitTime * 1000).toLocaleString()}</p>
                              {t.liquidationPrice && <p className="text-loss">Liq: ${t.liquidationPrice.toFixed(2)}</p>}
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Fee Breakdown</p>
                              <p key="maker" className="text-secondary-foreground">Maker: {formatCurrency(t.makerFees)}</p>
                              <p key="taker" className="text-secondary-foreground">Taker: {formatCurrency(t.takerFees)}</p>
                              {t.fundingFees !== undefined && <p key="funding">Funding: {formatCurrency(t.fundingFees)}</p>}
                            </div>
                          </div>
                          {t.tags && t.tags.length > 0 && (
                            <div className="mt-2 flex gap-1">
                              {t.tags.map(tag => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                            </div>
                          )}
                          {t.notes && <p className="mt-2 text-xs text-muted-foreground italic">{t.notes}</p>}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex items-center justify-between p-3 border-t border-border">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>
      {annotatingTrade && (
        <AnnotationModal trade={annotatingTrade} onClose={() => setAnnotatingTrade(null)} />
      )}
    </>
  );
}

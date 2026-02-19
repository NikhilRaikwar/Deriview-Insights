import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDeriverseData } from '@/hooks/useDeriverseData';
import { useFilters } from '@/hooks/useFilters';
import { mockTrades, mockOpenPositions, mockSpotBalances } from '@/lib/mock-data';
import type { DeriverseData } from '@/lib/deriverse';
import FilterBar from '@/components/layout/FilterBar';
import KPICards from '@/components/overview/KPICards';
import PnLChart from '@/components/overview/PnLChart';
import DailyPnLChart from '@/components/overview/DailyPnLChart';
import LongShortDonut from '@/components/overview/LongShortDonut';
import MarketOverview from '@/components/overview/MarketOverview';
import AccountKPIs from '@/components/overview/AccountKPIs';
import LiveTab from '@/components/overview/LiveTab';
import TradeTable from '@/components/journal/TradeTable';
import HeatmapChart from '@/components/analytics/HeatmapChart';
import SessionCards from '@/components/analytics/SessionCards';
import SymbolTable from '@/components/analytics/SymbolTable';
import StreakCard from '@/components/analytics/StreakCard';
import OrderTypeCard from '@/components/analytics/OrderTypeCard';
import FeesTab from '@/components/fees/FeesTab';
import RealFeesTab from '@/components/fees/RealFeesTab';
import PortfolioTab from '@/components/portfolio/PortfolioTab';
import RealPortfolioTab from '@/components/portfolio/RealPortfolioTab';
import { RefreshCw, Wallet, AlertTriangle, Loader2, Radio } from 'lucide-react';

const Index = () => {
  const { state, walletAddress, setWalletAddress, loadMarketData, loadClientData, refresh } = useDeriverseData();
  const { filters, filtered, updateFilter, resetFilters, symbols } = useFilters(mockTrades);
  const [inputAddress, setInputAddress] = useState('');

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  const isLoading = state.status === 'loading';
  const isLive = state.status === 'market-only' && state.mode === 'live';
  const hasLiveClient = state.status === 'loaded' && state.mode === 'live' && state.data.clientData !== null;

  // Prepare normalized data for Live Tab (works for both market-only and loaded states)
  const liveData: DeriverseData | null = state.status === 'loaded' ? state.data :
    state.status === 'market-only' ? {
      instruments: state.instruments,
      clientData: null,
      balances: [],
      perpPositions: [],
      spotOrders: [],
      totalSpotTrades: 0,
      totalPerpTrades: 0,
      totalRealizedPnl: 0,
      totalFees: 0,
      totalRebates: 0,
      totalFundingPaid: 0,
      points: 0,
    } : null;

  return (
    <div className="min-h-screen bg-background terminal-grid">
      {/* Navbar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold tracking-tight">
              <span className="text-profit">◆</span> Deriverse
            </h1>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-xs text-muted-foreground">Trading Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            {(isLive || hasLiveClient) ? (
              <Badge variant="outline" className="text-[10px] border-chart-volume/30 text-volume flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-volume animate-pulse" /> Solana Mainnet
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-chart-volume/30 text-muted-foreground">
                Network: Disconnected
              </Badge>
            )}

            <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
              {hasLiveClient ? 'Mixed Mode (Live + Demo)' : 'Demo Data'}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {state.status === 'market-only' && state.error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center animate-in slide-in-from-top-2">
          <p className="text-xs text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            <span className="font-semibold">Connection Failed:</span> {state.error}
          </p>
        </div>
      )}

      <main className="container px-4 py-4">
        {/* Wallet Connection - Re-enabled for Submission */}
        <div className="max-w-4xl mx-auto mb-8 relative z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Solana wallet address to load live account data..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="pl-9 bg-secondary/50 border-white/10"
                onKeyDown={(e) => e.key === 'Enter' && loadClientData(walletAddress)}
              />
            </div>
            <Button
              onClick={() => loadClientData(walletAddress)}
              disabled={isLoading || !walletAddress}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Load Account'}
            </Button>
          </div>
        </div>

        {/* Live Data Integration - Account Overview */}
        {(state.status === 'loaded' && state.data) && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Radio className="w-4 h-4 text-profit animate-pulse" /> Live Account Overview
              </h3>
              <Badge variant="outline" className="border-profit/30 text-profit">Real-Time On-Chain Data</Badge>
            </div>
            <AccountKPIs data={state.data} />
          </div>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <Card className="mb-4 border-destructive/50">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Connection Error</p>
                <p className="text-xs text-muted-foreground">{state.error}</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto h-7 text-xs" onClick={refresh}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Connecting to Deriverse on Solana...</p>
            </Card>
          </div>
        )}

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          symbols={symbols}
          tradeCount={filtered.length}
          onUpdateFilter={updateFilter}
          onReset={resetFilters}
        />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 bg-card border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="live" className="text-profit data-[state=active]:bg-profit/10">Live Data</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {(state.status === 'loaded' && state.data) && (
              <div className="mb-6">
                <AccountKPIs data={state.data} />
              </div>
            )}
            <KPICards trades={filtered} />
            <PnLChart trades={filtered} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyPnLChart trades={filtered} />
              <LongShortDonut trades={filtered} />
            </div>
          </TabsContent>

          {/* New Live Data Tab */}
          <TabsContent value="live">
            {liveData ? (
              <LiveTab data={liveData} isClientLoaded={state.status === 'loaded'} />
            ) : (
              <Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Waiting for network connection...</p>
                <Button variant="outline" className="mt-4" onClick={refresh}>Retry Connection</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="journal">
            <TradeTable trades={filtered} />
          </TabsContent>

          <TabsContent value="analytics">
            <HeatmapChart trades={filtered} />
            <SessionCards trades={filtered} />
            <OrderTypeCard trades={filtered} />
            <SymbolTable trades={filtered} />
            <StreakCard trades={filtered} />
          </TabsContent>

          <TabsContent value="fees" className="space-y-4 animate-in fade-in-50 duration-500">
            {state.status === 'loaded' && state.data ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Radio className="w-4 h-4 text-profit" /> Real-Time Fee Analysis
                  </h3>
                  <Badge variant="outline">On-Chain Data</Badge>
                </div>
                <RealFeesTab data={state.data} />
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Estimated Historical Projections (Demo)</span></div>
                </div>
                <FeesTab trades={filtered} />
              </>
            ) : (
              <FeesTab trades={filtered} />
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            {state.status === 'loaded' && state.data ? (
              <RealPortfolioTab
                perpPositions={state.data.perpPositions}
                spotOrders={state.data.spotOrders}
                balances={state.data.balances}
              />
            ) : (
              <PortfolioTab positions={mockOpenPositions} balances={mockSpotBalances} />
            )}
          </TabsContent>

          <TabsContent value="markets">
            <MarketOverview instruments={
              state.status === 'loaded' ? state.data.instruments :
                state.status === 'market-only' ? state.instruments : []
            } />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

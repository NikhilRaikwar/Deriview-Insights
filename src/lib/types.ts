export interface Trade {
  id: string;
  symbol: string;
  marketType: 'spot' | 'perpetual';
  side: 'long' | 'short' | 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage?: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  makerFees: number;
  takerFees: number;
  fundingFees?: number;
  entryTime: number;
  exitTime: number;
  duration: number;
  liquidationPrice?: number;
  margin?: number;
  notes?: string;
  tags?: string[];
}

export interface OpenPosition {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  liquidationPrice: number;
  leverage: number;
  margin: number;
  fundingRate: number;
}

export interface SpotBalance {
  token: string;
  symbol: string;
  balance: number;
  usdValue: number;
  change24h: number;
}

export interface AnalyticsFilters {
  dateRange: { from: Date | null; to: Date | null };
  symbol: string;
  marketType: 'all' | 'spot' | 'perpetual';
  side: 'all' | 'long' | 'short';
}

export interface SymbolStat {
  symbol: string;
  trades: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  volume: number;
  fees: number;
  best: number;
  worst: number;
}

export interface SessionStat {
  name: string;
  emoji: string;
  hours: string;
  trades: number;
  winRate: number;
  avgPnl: number;
  totalPnl: number;
}

export interface FeeBreakdown {
  maker: number;
  taker: number;
  funding: number;
  total: number;
}

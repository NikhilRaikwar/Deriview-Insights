import { Trade, OpenPosition, SpotBalance } from './types';

const SYMBOLS = ['SOL-PERP', 'BTC-PERP', 'ETH-PERP', 'SOL/USDC', 'ETH/USDC'];
const SIDES_PERP: ('long' | 'short')[] = ['long', 'short'];
const SIDES_SPOT: ('buy' | 'sell')[] = ['buy', 'sell'];
const ORDER_TYPES: ('market' | 'limit' | 'stop')[] = ['market', 'limit', 'stop'];
const TAGS = ['planned', 'system', 'FOMO', 'news', 'mistake'];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length)];
}

function generateTrade(index: number, baseTime: number): Trade {
  const symbol = pick(SYMBOLS);
  const isPerp = symbol.includes('PERP');
  const marketType = isPerp ? 'perpetual' : 'spot' as const;
  const side = isPerp ? pick(SIDES_PERP) : pick(SIDES_SPOT);
  const orderType = pick(ORDER_TYPES);
  const leverage = isPerp ? pick([1, 2, 3, 5, 10]) : undefined;

  let entryPrice: number;
  if (symbol.startsWith('SOL')) entryPrice = rand(18, 250);
  else if (symbol.startsWith('BTC')) entryPrice = rand(25000, 105000);
  else entryPrice = rand(1200, 4000);

  const pnlPercent = rand(-15, 20);
  const exitPrice = entryPrice * (1 + pnlPercent / 100 * (side === 'long' || side === 'buy' ? 1 : -1));
  const size = rand(50, 50000);
  const pnl = size * (pnlPercent / 100);
  const duration = randInt(60, 86400 * 3);
  const entryTime = baseTime - index * randInt(3600, 86400);
  const exitTime = entryTime + duration;
  const takerFees = size * rand(0.0002, 0.001);
  const makerFees = size * rand(0.0001, 0.0005);
  const fundingFees = isPerp ? size * rand(-0.001, 0.001) : undefined;
  const fees = takerFees + makerFees + (fundingFees || 0);

  const hasNotes = Math.random() > 0.6;
  const hasTags = Math.random() > 0.5;

  return {
    id: `trade-${index}-${Date.now()}`,
    symbol,
    marketType,
    side,
    orderType,
    entryPrice,
    exitPrice,
    size,
    leverage,
    pnl,
    pnlPercent,
    fees,
    makerFees,
    takerFees,
    fundingFees,
    entryTime,
    exitTime,
    duration,
    liquidationPrice: isPerp ? entryPrice * (side === 'long' ? 0.7 : 1.3) : undefined,
    margin: isPerp ? size / (leverage || 1) : undefined,
    notes: hasNotes ? pick([
      'Good entry on breakout',
      'Should have taken profits earlier',
      'News-driven move, caught the trend',
      'Overlevered, cut loss quickly',
      'Perfect setup execution',
      'Scaled in at support',
    ]) : undefined,
    tags: hasTags ? [pick(TAGS), ...(Math.random() > 0.5 ? [pick(TAGS)] : [])].filter((v, i, a) => a.indexOf(v) === i) : undefined,
  };
}

const NOW = Math.floor(Date.now() / 1000);
export const mockTrades: Trade[] = Array.from({ length: 200 }, (_, i) => generateTrade(i, NOW));

export const mockOpenPositions: OpenPosition[] = [
  {
    symbol: 'SOL-PERP',
    side: 'long',
    size: 12500,
    entryPrice: 178.45,
    markPrice: 185.20,
    unrealizedPnl: 472.50,
    unrealizedPnlPercent: 3.78,
    liquidationPrice: 142.50,
    leverage: 5,
    margin: 2500,
    fundingRate: 0.0001,
  },
  {
    symbol: 'BTC-PERP',
    side: 'short',
    size: 25000,
    entryPrice: 98450,
    markPrice: 97200,
    unrealizedPnl: 317.80,
    unrealizedPnlPercent: 1.27,
    liquidationPrice: 108500,
    leverage: 3,
    margin: 8333,
    fundingRate: -0.0002,
  },
  {
    symbol: 'ETH-PERP',
    side: 'long',
    size: 8000,
    entryPrice: 3420,
    markPrice: 3380,
    unrealizedPnl: -93.57,
    unrealizedPnlPercent: -1.17,
    liquidationPrice: 2890,
    leverage: 5,
    margin: 1600,
    fundingRate: 0.00015,
  },
];

export const mockSpotBalances: SpotBalance[] = [
  { token: 'SOL', symbol: 'SOL', balance: 142.5, usdValue: 26367.75, change24h: 4.2 },
  { token: 'USDC', symbol: 'USDC', balance: 15420.00, usdValue: 15420.00, change24h: 0.01 },
  { token: 'ETH', symbol: 'ETH', balance: 3.25, usdValue: 10985.00, change24h: -1.8 },
  { token: 'BTC', symbol: 'BTC', balance: 0.15, usdValue: 14587.50, change24h: 2.1 },
];

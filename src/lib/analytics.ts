import { Trade, SymbolStat, SessionStat, FeeBreakdown, AnalyticsFilters } from './types';

export function calcTotalPnL(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.pnl, 0);
}

export function calcWinRate(trades: Trade[]): number {
  if (!trades.length) return 0;
  const wins = trades.filter(t => t.pnl > 0).length;
  return (wins / trades.length) * 100;
}

export function calcTotalVolume(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.size, 0);
}

export function calcTotalFees(trades: Trade[]): number {
  return trades.reduce((sum, t) => sum + t.fees, 0);
}

export function calcAvgDuration(trades: Trade[]): number {
  if (!trades.length) return 0;
  return trades.reduce((sum, t) => sum + t.duration, 0) / trades.length;
}

export function calcLargestGain(trades: Trade[]): Trade | null {
  if (!trades.length) return null;
  return trades.reduce((best, t) => (t.pnl > best.pnl ? t : best), trades[0]);
}

export function calcLargestLoss(trades: Trade[]): Trade | null {
  if (!trades.length) return null;
  return trades.reduce((worst, t) => (t.pnl < worst.pnl ? t : worst), trades[0]);
}

export function calcAvgWin(trades: Trade[]): number {
  const wins = trades.filter(t => t.pnl > 0);
  if (!wins.length) return 0;
  return wins.reduce((s, t) => s + t.pnl, 0) / wins.length;
}

export function calcAvgLoss(trades: Trade[]): number {
  const losses = trades.filter(t => t.pnl < 0);
  if (!losses.length) return 0;
  return losses.reduce((s, t) => s + t.pnl, 0) / losses.length;
}

export function calcLongShortRatio(trades: Trade[]): { long: number; short: number } {
  const long = trades.filter(t => t.side === 'long' || t.side === 'buy').length;
  const short = trades.filter(t => t.side === 'short' || t.side === 'sell').length;
  return { long, short };
}

export function calcCumulativePnL(trades: Trade[]): { date: Date; pnl: number }[] {
  const sorted = [...trades].sort((a, b) => a.exitTime - b.exitTime);
  let cum = 0;
  return sorted.map(t => {
    cum += t.pnl;
    return { date: new Date(t.exitTime * 1000), pnl: cum };
  });
}

export function calcDrawdown(trades: Trade[]): { date: Date; drawdown: number }[] {
  const sorted = [...trades].sort((a, b) => a.exitTime - b.exitTime);
  let cum = 0;
  let peak = 0;
  return sorted.map(t => {
    cum += t.pnl;
    peak = Math.max(peak, cum);
    return { date: new Date(t.exitTime * 1000), drawdown: cum - peak };
  });
}

export function calcDailyPnL(trades: Trade[]): { date: string; pnl: number }[] {
  const map = new Map<string, number>();
  trades.forEach(t => {
    const d = new Date(t.exitTime * 1000).toISOString().split('T')[0];
    map.set(d, (map.get(d) || 0) + t.pnl);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl }));
}

export function calcHeatmap(trades: Trade[]): { day: number; hour: number; avgPnl: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  trades.forEach(t => {
    const d = new Date(t.entryTime * 1000);
    const key = `${d.getDay()}-${d.getHours()}`;
    const curr = map.get(key) || { total: 0, count: 0 };
    curr.total += t.pnl;
    curr.count += 1;
    map.set(key, curr);
  });
  const result: { day: number; hour: number; avgPnl: number; count: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const data = map.get(`${day}-${hour}`);
      result.push({
        day,
        hour,
        avgPnl: data ? data.total / data.count : 0,
        count: data?.count || 0,
      });
    }
  }
  return result;
}

export function calcSymbolStats(trades: Trade[]): SymbolStat[] {
  const map = new Map<string, Trade[]>();
  trades.forEach(t => {
    const arr = map.get(t.symbol) || [];
    arr.push(t);
    map.set(t.symbol, arr);
  });
  return Array.from(map.entries()).map(([symbol, ts]) => ({
    symbol,
    trades: ts.length,
    winRate: calcWinRate(ts),
    totalPnl: calcTotalPnL(ts),
    avgPnl: calcTotalPnL(ts) / ts.length,
    volume: calcTotalVolume(ts),
    fees: calcTotalFees(ts),
    best: Math.max(...ts.map(t => t.pnl)),
    worst: Math.min(...ts.map(t => t.pnl)),
  }));
}

export function calcSessionStats(trades: Trade[]): SessionStat[] {
  const sessions = [
    { name: 'Asia', emoji: '🌏', hours: '00:00-08:00 UTC', start: 0, end: 8 },
    { name: 'London', emoji: '🇬🇧', hours: '08:00-16:00 UTC', start: 8, end: 16 },
    { name: 'New York', emoji: '🇺🇸', hours: '16:00-24:00 UTC', start: 16, end: 24 },
  ];
  return sessions.map(s => {
    const ts = trades.filter(t => {
      const h = new Date(t.entryTime * 1000).getUTCHours();
      return h >= s.start && h < s.end;
    });
    return {
      name: s.name,
      emoji: s.emoji,
      hours: s.hours,
      trades: ts.length,
      winRate: calcWinRate(ts),
      avgPnl: ts.length ? calcTotalPnL(ts) / ts.length : 0,
      totalPnl: calcTotalPnL(ts),
    };
  });
}

export function calcStreak(trades: Trade[]): { current: number; best: number; worst: number } {
  const sorted = [...trades].sort((a, b) => a.exitTime - b.exitTime);
  let current = 0, best = 0, worst = 0, streak = 0;
  sorted.forEach(t => {
    if (t.pnl > 0) streak = streak > 0 ? streak + 1 : 1;
    else if (t.pnl < 0) streak = streak < 0 ? streak - 1 : -1;
    else streak = 0;
    if (streak > best) best = streak;
    if (streak < worst) worst = streak;
    current = streak;
  });
  return { current, best, worst };
}

export function calcFeeBreakdown(trades: Trade[]): FeeBreakdown {
  const maker = trades.reduce((s, t) => s + t.makerFees, 0);
  const taker = trades.reduce((s, t) => s + t.takerFees, 0);
  const funding = trades.reduce((s, t) => s + (t.fundingFees || 0), 0);
  return { maker, taker, funding, total: maker + taker + funding };
}

export function filterTrades(trades: Trade[], filters: AnalyticsFilters): Trade[] {
  return trades.filter(t => {
    if (filters.symbol !== 'ALL' && t.symbol !== filters.symbol) return false;
    if (filters.marketType !== 'all' && t.marketType !== filters.marketType) return false;
    if (filters.side !== 'all') {
      const isLong = t.side === 'long' || t.side === 'buy';
      if (filters.side === 'long' && !isLong) return false;
      if (filters.side === 'short' && isLong) return false;
    }
    if (filters.dateRange.from) {
      const tradeDate = new Date(t.entryTime * 1000);
      if (tradeDate < filters.dateRange.from) return false;
    }
    if (filters.dateRange.to) {
      const tradeDate = new Date(t.exitTime * 1000);
      if (tradeDate > filters.dateRange.to) return false;
    }
    return true;
  });
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(2)}`;
}

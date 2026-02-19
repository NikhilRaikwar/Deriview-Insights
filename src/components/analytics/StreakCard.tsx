import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/lib/types';
import { calcStreak } from '@/lib/analytics';
import { useMemo } from 'react';

export default function StreakCard({ trades }: { trades: Trade[] }) {
  const streak = useMemo(() => calcStreak(trades), [trades]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Streak Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <span className={`text-3xl font-bold font-mono ${streak.current > 0 ? 'text-profit' : streak.current < 0 ? 'text-loss' : 'text-muted-foreground'}`}>
              {Math.abs(streak.current)}
            </span>
            <Badge variant="secondary" className="block mt-1 text-[10px]">
              {streak.current > 0 ? '🔥 Win Streak' : streak.current < 0 ? '❄️ Loss Streak' : '— Neutral'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Best Win</p>
            <span className="text-3xl font-bold font-mono text-profit">{streak.best}</span>
            <p className="text-[10px] text-muted-foreground mt-1">consecutive</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Worst Loss</p>
            <span className="text-3xl font-bold font-mono text-loss">{Math.abs(streak.worst)}</span>
            <p className="text-[10px] text-muted-foreground mt-1">consecutive</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trade } from '@/lib/types';
import { calcHeatmap, formatCurrency } from '@/lib/analytics';
import { useMemo } from 'react';
import React from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColor(value: number, max: number): string {
  if (value === 0) return 'hsl(220 13% 13%)';
  const intensity = Math.min(Math.abs(value) / (max || 1), 1);
  if (value > 0) return `hsl(165 100% ${42 - intensity * 20}% / ${0.3 + intensity * 0.7})`;
  return `hsl(348 100% ${65 - intensity * 20}% / ${0.3 + intensity * 0.7})`;
}

export default function HeatmapChart({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => calcHeatmap(trades), [trades]);
  const maxVal = useMemo(() => Math.max(...data.map(d => Math.abs(d.avgPnl)), 1), [data]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Time-of-Day Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `40px repeat(24, 1fr)` }}>
            {/* Header */}
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="text-[9px] text-center text-muted-foreground">{h}</div>
            ))}
            {/* Rows */}
            {[1, 2, 3, 4, 5, 6, 0].map(day => (
              <React.Fragment key={day}>
                <div key={`label-${day}`} className="text-[10px] text-muted-foreground flex items-center">{DAYS[day]}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = data.find(d => d.day === day && d.hour === hour);
                  return (
                    <Tooltip key={`${day}-${hour}`}>
                      <TooltipTrigger asChild>
                        <div
                          className="w-5 h-5 rounded-sm cursor-pointer hover:ring-1 hover:ring-foreground/20"
                          style={{ backgroundColor: getColor(cell ? cell.avgPnl : 0, maxVal) }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        <div className="text-center font-bold mb-1">{DAYS[day]} {hour}:00</div>
                        <div className="grid gap-1">
                          <p>Trades: {cell ? cell.count : 0}</p>
                          <p className={cell && cell.avgPnl >= 0 ? 'text-profit' : 'text-loss'}>
                            Avg PnL: {formatCurrency(cell ? cell.avgPnl : 0)}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">Loss</span>
            <div className="h-2 w-24 rounded" style={{ background: 'linear-gradient(to right, #ff4d6d, hsl(220 13% 13%), #00d4aa)' }} />
            <span className="text-[10px] text-muted-foreground">Profit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

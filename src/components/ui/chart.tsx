import React from "react";
import type { TooltipProps } from "recharts";

export type ChartConfig = Record<string, { label: string; color?: string }>;

export function ChartContainer({ children, className = "", config }: { children: React.ReactNode; className?: string; config?: ChartConfig }) {
  return (
    <div className={`rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/30 shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function ChartTooltip({ content }: { content: React.ReactNode }) {
  // Just a passthrough for recharts' content prop
  return content;
}

// Fix TooltipProps usage and types
export function ChartTooltipContent({ active, payload, label, className = "", labelFormatter }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={`rounded-xl bg-white/90 dark:bg-gray-900/90 p-3 shadow border border-gray-200 ${className}`}>
      <div className="font-semibold mb-1">{labelFormatter ? labelFormatter(label) : label}</div>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          <span className="font-medium">{entry.name}</span>:
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export type { ChartConfig };

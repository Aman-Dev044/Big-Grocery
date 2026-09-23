'use client';

import { useState } from 'react';
import { pct } from './viz';

export interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  total: number;
  /** Suffix used in the tooltip, e.g. "products". */
  unit?: string;
}

/**
 * Part-to-whole as a single horizontal stacked bar.
 *
 * - 2px surface gaps separate the segments (no strokes around marks)
 * - a legend is always present, so identity never rests on colour alone
 * - an inline value is drawn only where the segment is wide enough to hold it
 */
export default function StackedShareBar({ segments, total, unit = 'items' }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const visible = segments.filter((s) => s.value > 0);

  if (total === 0) {
    return <p className="py-6 text-center text-[13px] text-neutral-400">No data yet</p>;
  }

  return (
    <div>
      <div className="flex h-6 w-full gap-[2px] overflow-hidden rounded">
        {visible.map((s) => {
          const share = pct(s.value, total);
          // Roughly 34px of room is needed before a two-digit label reads cleanly.
          const fitsLabel = share > 14;
          return (
            <div
              key={s.key}
              role="img"
              aria-label={`${s.label}: ${s.value} ${unit}, ${share.toFixed(1)}%`}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
              style={{ width: `${share}%`, backgroundColor: s.color }}
              className={`grid place-items-center transition-opacity first:rounded-l last:rounded-r ${
                hover && hover !== s.key ? 'opacity-55' : 'opacity-100'
              }`}
            >
              {fitsLabel && (
                <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {s.value}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <ul className="mt-4 space-y-2">
        {segments.map((s) => (
          <li
            key={s.key}
            onMouseEnter={() => setHover(s.key)}
            onMouseLeave={() => setHover(null)}
            className="flex items-center gap-2.5 text-[13px]"
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-neutral-700">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-neutral-900">{s.value}</span>
            <span className="w-12 text-right tabular-nums text-neutral-400">
              {pct(s.value, total).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

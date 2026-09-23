'use client';

import { useState } from 'react';
import { SEQUENTIAL } from './viz';

export interface Row {
  name: string;
  count: number;
  value?: number;
  /** The folded tail bucket — drawn a step lighter so it reads as "the rest". */
  isOther?: boolean;
}

interface Props {
  rows: Row[];
  /** Rendered in the hover tooltip, e.g. "products". */
  unit?: string;
  /** Optional secondary figure per row, already formatted. */
  meta?: (row: Row) => string;
}

/**
 * Ranked magnitude as horizontal bars — one hue, value direct-labelled at the
 * tip, so no legend is needed (a single series is named by the card's title).
 * Bars are capped at 18px with a 4px rounded data-end and a square baseline.
 */
export default function RankedBars({ rows, unit = 'products', meta }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-[13px] text-neutral-400">No data yet</p>;
  }

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const width = (r.count / max) * 100;
        const dim = hover !== null && hover !== r.name;

        return (
          <li
            key={r.name}
            onMouseEnter={() => setHover(r.name)}
            onMouseLeave={() => setHover(null)}
            title={`${r.name}: ${r.count} ${unit}`}
            className={`transition-opacity ${dim ? 'opacity-55' : 'opacity-100'}`}
          >
            <div className="mb-1 flex items-baseline gap-3">
              <span className="min-w-0 flex-1 truncate text-[13px] text-neutral-700">{r.name}</span>
              {meta && <span className="text-[12px] tabular-nums text-neutral-400">{meta(r)}</span>}
              <span className="text-[13px] font-semibold tabular-nums text-neutral-900">
                {r.count}
              </span>
            </div>
            {/* Track keeps every bar on the same baseline */}
            <div className="h-[10px] w-full rounded-sm bg-neutral-100">
              <div
                className="h-full rounded-l-sm"
                style={{
                  width: `${width}%`,
                  backgroundColor: r.isOther ? '#9ec5f4' : SEQUENTIAL,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

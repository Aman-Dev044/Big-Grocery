export const TAGLINES = [
  '100 Years of Trust',
  'One-Stop Shop for Daily Needs',
  'Quality & Purity Guaranteed',
  'Wholesale Prices',
  'Family-Owned Since 4 Generations',
];

/**
 * The store's promise line. `row` is the wide banner used under a page;
 * `stack` is the narrow version that fits the sidebar rail.
 */
export default function TaglineStrip({ variant = 'row' }: { variant?: 'row' | 'stack' }) {
  if (variant === 'stack') {
    return (
      <ul className="space-y-1.5">
        {TAGLINES.map((line) => (
          <li key={line} className="flex gap-2 text-[11.5px] leading-snug text-neutral-700">
            <span aria-hidden className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-[#E2231A]" />
            {line}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-[#FFF6DC] px-5 py-3.5">
      <ul className="flex min-w-max items-center justify-center gap-0 text-[12.5px] font-semibold text-neutral-700">
        {TAGLINES.map((line, i) => (
          <li key={line} className="flex items-center">
            {i > 0 && <span aria-hidden className="mx-3 h-3.5 w-px bg-[#E2231A]/35" />}
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

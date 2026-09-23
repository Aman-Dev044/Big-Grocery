/**
 * Chart tokens for the dashboard.
 *
 * Categorical pair validated against the white card surface:
 *   node scripts/validate_palette.js "#2a78d6,#eb6834" --mode light --surface "#ffffff"
 *   → all checks PASS (CVD ΔE 24.7, normal-vision ΔE 33.6, contrast ≥ 3:1)
 *
 * Status colors are the fixed reserved set — never reused as a series hue.
 * `warning` sits below 3:1 on a light surface by design, so every status mark
 * ships with a visible text label beside it, never colour alone.
 */

export const SERIES = ['#2a78d6', '#eb6834'] as const; // categorical slots 1-2

export const SEQUENTIAL = '#2a78d6'; // single hue for magnitude/ranking

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  critical: '#d03b3b',
} as const;

export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
};

/** Compact number for stat tiles: 1,284 · 12.9K · 4.2M */
export function compact(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.abs(n) >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString('en-IN');
}

export const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

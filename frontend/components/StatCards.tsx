import { IconBars, IconBox, IconDot, IconEyeOff } from './Icons';
import type { Stats } from '@/lib/types';

interface Card {
  label: string;
  value: number;
  delta: string;
  deltaTone: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function StatCards({ stats }: { stats: Stats | null }) {
  const n = (v?: number) => (stats ? v ?? 0 : 0);

  const cards: Card[] = [
    {
      label: 'Total Products',
      value: n(stats?.total),
      delta: '+12%',
      deltaTone: 'text-emerald-600',
      icon: <IconBox className="text-[#2563EB]" />,
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Active',
      value: n(stats?.active),
      delta: '+8%',
      deltaTone: 'text-emerald-600',
      icon: <IconDot className="h-3.5 w-3.5 text-emerald-500" />,
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Low Stock',
      value: n(stats?.lowStock),
      delta: '+5%',
      deltaTone: 'text-amber-600',
      icon: <IconDot className="h-3.5 w-3.5 text-amber-500" />,
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Out of Stock',
      value: n(stats?.outOfStock),
      delta: '+33%',
      deltaTone: 'text-rose-600',
      icon: <IconDot className="h-3.5 w-3.5 text-rose-500" />,
      iconBg: 'bg-rose-50',
    },
    {
      label: 'Hidden',
      value: n(stats?.hidden),
      delta: '0%',
      deltaTone: 'text-neutral-500',
      icon: <IconEyeOff className="text-neutral-500" />,
      iconBg: 'bg-neutral-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${c.iconBg}`}>{c.icon}</span>
            <span className="text-[13px] font-medium text-neutral-600">{c.label}</span>
          </div>
          <p className="mt-3 text-[26px] font-bold leading-none text-neutral-900">
            {c.value.toLocaleString('en-IN')}
          </p>
          <div className="mt-2.5 flex items-end justify-between">
            <span>
              <span className={`text-[13px] font-semibold ${c.deltaTone}`}>{c.delta}</span>
              <span className="block text-[11px] text-neutral-400">vs. last month</span>
            </span>
            <IconBars className="text-neutral-300" />
          </div>
        </div>
      ))}
    </div>
  );
}

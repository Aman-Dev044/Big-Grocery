'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import RankedBars from '@/components/charts/RankedBars';
import StackedShareBar, { type Segment } from '@/components/charts/StackedShareBar';
import { STATUS, SERIES, compact } from '@/components/charts/viz';
import {
  IconArrowRight,
  IconBox,
  IconChart,
  IconCheck,
  IconFolder,
  IconRefresh,
  IconTag,
  IconUpload,
  IconWarn,
} from '@/components/Icons';
import { STATUS_CLASS, STATUS_LABEL, fetchDashboard, formatDateTime, inr } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Dashboard } from '@/lib/types';

/* ---------------------------------------------------------------- pieces */

function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-neutral-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-neutral-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatTile({
  label,
  value,
  note,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${iconClass}`}>{icon}</span>
        <span className="text-[13px] font-medium text-neutral-600">{label}</span>
      </div>
      <p className="mt-3 text-[26px] font-bold leading-none text-neutral-900">{value}</p>
      <p className="mt-2 text-[11.5px] text-neutral-400">{note}</p>
    </div>
  );
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-[9px] text-neutral-400">
        N/A
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-10 w-10 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-0.5"
    />
  );
}

/* ------------------------------------------------------------------ page */

export default function DashboardPage() {
  const { admin } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-20 animate-pulse rounded-2xl bg-neutral-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
        <p className="text-[15px] font-semibold text-rose-700">Could not load the dashboard</p>
        <p className="mx-auto mt-1.5 max-w-lg text-[13.5px] text-neutral-500">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FFD500] px-4 py-2.5 text-[13.5px] font-bold text-neutral-900 hover:bg-[#f5cd00]"
        >
          <IconRefresh width={16} height={16} />
          Retry
        </button>
      </div>
    );
  }

  const { totals, subCategories, categories, topBrands, lowStockItems, recentProducts, lastImport } =
    data;

  const empty = totals.products === 0;

  const stockSegments: Segment[] = [
    { key: 'in', label: 'In stock', value: totals.inStock, color: STATUS.good },
    { key: 'low', label: 'Low stock', value: totals.lowStock, color: STATUS.warning },
    { key: 'out', label: 'Out of stock', value: totals.outOfStock, color: STATUS.critical },
  ];

  const categorySegments: Segment[] = categories.map((c, i) => ({
    key: c.name,
    label: c.name,
    value: c.count,
    color: SERIES[i % SERIES.length],
  }));

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-neutral-900">{greeting}!</h1>
          <p className="mt-1 text-[14px] text-neutral-500">
            Here is what the catalogue looks like for{' '}
            <span className="font-medium text-neutral-700">{admin?.name}</span> today.
          </p>
        </div>
        <span className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-neutral-600">
          {today}
        </span>
      </div>

      {empty && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-[#FFC107] bg-[#FFFBEB] px-5 py-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FFD500]">
            <IconUpload className="text-neutral-900" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-neutral-900">Your catalogue is empty</p>
            <p className="text-[13px] text-neutral-600">
              Import the product sheet and the images ZIP to get started.
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-[#FFD500] px-4 py-2.5 text-[13.5px] font-bold text-neutral-900 hover:bg-[#f5cd00]"
          >
            Go to Upload
            <IconArrowRight width={16} height={16} />
          </Link>
        </div>
      )}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total Products"
          value={compact(totals.products)}
          note={`${totals.images.toLocaleString('en-IN')} images linked`}
          icon={<IconBox className="text-[#2563EB]" />}
          iconClass="bg-blue-50"
        />
        <StatTile
          label="Inventory Value"
          value={inr(totals.inventoryValue)}
          note={`${compact(totals.totalStock)} units in stock`}
          icon={<IconChart className="text-[#15803D]" />}
          iconClass="bg-emerald-50"
        />
        <StatTile
          label="Average Margin"
          value={`${totals.avgMargin}%`}
          note={`${inr(totals.potentialSavings)} total customer saving`}
          icon={<IconTag className="text-[#B45309]" />}
          iconClass="bg-amber-50"
        />
        <StatTile
          label="Catalogue Spread"
          value={`${totals.categories} / ${totals.brands}`}
          note="categories / brands"
          icon={<IconFolder className="text-[#7C3AED]" />}
          iconClass="bg-violet-50"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Stock health"
          subtitle={`${totals.products} products by availability`}
          className="lg:col-span-1"
        >
          <StackedShareBar segments={stockSegments} total={totals.products} unit="products" />
        </Card>

        <Card
          title="Products by sub-category"
          subtitle="Top 8, remainder folded into Other"
          className="lg:col-span-2"
          action={
            <Link
              href="/products"
              className="text-[13px] font-semibold text-[#1D4ED8] hover:underline"
            >
              View all
            </Link>
          }
        >
          <RankedBars rows={subCategories} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Category split" subtitle="Share of the catalogue">
          <StackedShareBar segments={categorySegments} total={totals.products} unit="products" />
        </Card>

        <Card title="Top brands" subtitle="By number of products">
          <RankedBars rows={topBrands} />
        </Card>

        <Card
          title="Needs restocking"
          subtitle="Lowest stock first"
          action={
            <Link
              href="/products?status=low_stock"
              className="text-[13px] font-semibold text-[#1D4ED8] hover:underline"
            >
              View all
            </Link>
          }
        >
          {lowStockItems.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3.5 text-[13px] font-medium text-emerald-800">
              <IconCheck width={16} height={16} />
              Everything is well stocked.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStockItems.map((p) => (
                <li key={p._id}>
                  <Link href={`/products/${p._id}`} className="flex items-center gap-3 group">
                    <Thumb src={p.primaryImage} alt={p.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-neutral-800 group-hover:text-[#1D4ED8]">
                        {p.name}
                      </span>
                      <span className="block text-[12px] text-neutral-500">
                        {p.stock} left · {p.weight || p.sku}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${STATUS_CLASS[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Recently imported"
          subtitle="Newest products in the catalogue"
          className="lg:col-span-2"
        >
          {recentProducts.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-neutral-400">Nothing imported yet</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentProducts.map((p) => (
                <li key={p._id}>
                  <Link href={`/products/${p._id}`} className="flex items-center gap-3 py-2.5 group">
                    <Thumb src={p.primaryImage} alt={p.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-neutral-800 group-hover:text-[#1D4ED8]">
                        {p.name}
                      </span>
                      <span className="block text-[12px] text-neutral-500">
                        {p.sku} · {p.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[13.5px] font-semibold text-neutral-900">
                        {inr(p.price)}
                      </span>
                      {p.mrp > p.price && (
                        <span className="block text-[11.5px] text-neutral-400 line-through">
                          {inr(p.mrp)}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Last import" subtitle="Most recent bulk upload">
          {!lastImport ? (
            <p className="py-6 text-center text-[13px] text-neutral-400">No imports yet</p>
          ) : (
            <>
              <dl className="space-y-2.5 text-[13px]">
                {[
                  ['Rows read', lastImport.totalRows],
                  ['Products created', lastImport.productsCreated],
                  ['Images mapped', lastImport.imagesLinked],
                  ['Took', `${(lastImport.durationMs / 1000).toFixed(2)}s`],
                  ['When', formatDateTime(lastImport.createdAt).date],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between border-b border-neutral-100 pb-2">
                    <dt className="text-neutral-500">{k}</dt>
                    <dd className="font-semibold tabular-nums text-neutral-800">{v}</dd>
                  </div>
                ))}
              </dl>

              {lastImport.warnings.length > 0 ? (
                <div className="mt-3 rounded-xl bg-amber-50 px-3.5 py-3">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-amber-800">
                    <IconWarn width={15} height={15} />
                    {lastImport.warnings.length} warning
                    {lastImport.warnings.length === 1 ? '' : 's'}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-[12px] text-amber-800">
                    {lastImport.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-[12.5px] font-medium text-emerald-800">
                  <IconCheck width={15} height={15} />
                  Clean import — every row matched a folder.
                </p>
              )}

              <Link
                href="/upload"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-[13.5px] font-semibold text-neutral-700 transition hover:border-[#FFC107] hover:bg-[#FFFCF0]"
              >
                <IconUpload width={16} height={16} />
                New import
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

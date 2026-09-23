'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ProductTable from '@/components/ProductTable';
import { useLoginPrompt } from '@/components/Shell';
import { useAuth } from '@/lib/auth';
import StatCards from '@/components/StatCards';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFilter,
  IconFolder,
  IconGrid,
  IconList,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTag,
  IconTarget,
  IconTrash,
  IconUpload,
} from '@/components/Icons';
import { fetchProducts, fetchStats } from '@/lib/api';
import type { Pagination, Product, Stats } from '@/lib/types';

const PAGE_SIZES = [10, 25, 50, 100];

/** Compact page list: 1 2 3 4 5 ... 14 */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i > 1 && i < total) pages.add(i);
  }
  if (current <= 4) [2, 3, 4, 5].forEach((p) => pages.add(p));
  if (current >= total - 3) [total - 4, total - 3, total - 2, total - 1].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const DEAD_BUTTON =
  'flex cursor-not-allowed items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-neutral-400';

const DEAD_SELECT =
  'flex cursor-not-allowed items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] text-neutral-400';

export default function ProductsPage() {
  const { admin } = useAuth();
  const openLogin = useLoginPrompt();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, s] = await Promise.all([
        fetchProducts({ page, limit, search, category, status }),
        fetchStats(),
      ]);
      setProducts(list.data);
      setPagination(list.pagination);
      setStats(s.data);
      setSelected(new Set());
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — is the backend running on ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1004/api'} ?`
          : 'Failed to load products'
      );
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, category, status]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === products.length ? new Set() : new Set(products.map((p) => p._id))
    );

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = useMemo(() => pageWindow(page, totalPages), [page, totalPages]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-neutral-900">Products</h1>
          <p className="mt-1 text-[14px] text-neutral-500">
            Manage your product catalog, stock, prices and more.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {admin ? (
            <Link
              href="/upload"
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-neutral-700 transition hover:border-[#FFC107] hover:bg-[#FFFCF0]"
            >
              <IconUpload width={17} height={17} />
              Import
            </Link>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              title="Admin login required"
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-neutral-700 transition hover:border-[#FFC107] hover:bg-[#FFFCF0]"
            >
              <IconUpload width={17} height={17} />
              Import
            </button>
          )}
          <span className={DEAD_BUTTON} title="Not available in this demo">
            <IconDownload width={17} height={17} />
            Export
          </span>
          <span className={DEAD_BUTTON} title="Not available in this demo">
            <IconTarget width={17} height={17} />
            Bulk Update
          </span>
          <span
            className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#FFD500] px-4 py-2.5 text-[13.5px] font-bold text-neutral-900 opacity-70"
            title="Not available in this demo"
          >
            <IconPlus width={17} height={17} />
            Add Product
          </span>
        </div>
      </div>

      <StatCards stats={stats} />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-6">
        <div className="relative xl:col-span-2">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products by name, SKU, barcode..."
            className="h-[46px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-[13.5px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#FFC107]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="h-[46px] rounded-xl border border-neutral-200 bg-white px-3.5 text-[13.5px] text-neutral-700 outline-none focus:border-[#FFC107]"
        >
          <option value="">All Categories</option>
          {(stats?.categories ?? []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className={`${DEAD_SELECT} h-[46px]`} title="Not available in this demo">
          All Brands
        </span>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-[46px] rounded-xl border border-neutral-200 bg-white px-3.5 text-[13.5px] text-neutral-700 outline-none focus:border-[#FFC107]"
        >
          <option value="">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        <span className={`${DEAD_SELECT} h-[46px]`} title="Not available in this demo">
          <span className="flex items-center gap-2">
            <IconFilter width={16} height={16} />
            More Filters
          </span>
        </span>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-neutral-200 px-4 py-3">
          <span className="mr-1 text-[13.5px] font-semibold text-neutral-700">
            {selected.size} products selected
          </span>
          {[
            { label: 'Bulk Edit', icon: IconPencil },
            { label: 'Update Stock', icon: IconTarget },
            { label: 'Change Category', icon: IconFolder },
            { label: 'Add to Offer', icon: IconTag },
          ].map(({ label, icon: Icon }) => (
            <span
              key={label}
              title="Not available in this demo"
              className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-neutral-400"
            >
              <Icon width={16} height={16} />
              {label}
            </span>
          ))}
          <span
            title="Not available in this demo"
            className="flex cursor-not-allowed items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-rose-300"
          >
            <IconTrash width={16} height={16} />
            Delete
          </span>

          <span className="ml-auto flex items-center gap-1">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-neutral-700">
              <IconList width={17} height={17} />
            </span>
            <span
              title="Not available in this demo"
              className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-lg text-neutral-300"
            >
              <IconGrid width={17} height={17} />
            </span>
          </span>
        </div>

        {error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-rose-700">Could not load products</p>
            <p className="mx-auto mt-1.5 max-w-lg text-[13.5px] text-neutral-500">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 rounded-xl bg-[#FFD500] px-4 py-2.5 text-[13.5px] font-bold text-neutral-900 hover:bg-[#f5cd00]"
            >
              Retry
            </button>
          </div>
        ) : (
          <ProductTable
            products={products}
            loading={loading}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3.5">
          <p className="text-[13.5px] text-neutral-500">
            Showing {from}-{to} of {total.toLocaleString('en-IN')} products
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-600 disabled:opacity-40"
            >
              <IconChevronLeft width={16} height={16} />
            </button>

            {pages.map((p, i) =>
              p === 'gap' ? (
                <span key={`gap-${i}`} className="px-1.5 text-neutral-400">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`h-9 min-w-9 rounded-lg px-2.5 text-[13.5px] font-semibold ${
                    p === page
                      ? 'bg-neutral-800 text-white'
                      : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-600 disabled:opacity-40"
            >
              <IconChevronRight width={16} height={16} />
            </button>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-700 outline-none focus:border-[#FFC107]"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

    </div>
  );
}

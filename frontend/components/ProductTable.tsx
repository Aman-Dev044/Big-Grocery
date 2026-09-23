'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconCopy, IconDots, IconPencil } from './Icons';
import { STATUS_CLASS, STATUS_LABEL, formatDateTime, inr } from '@/lib/api';
import type { Product } from '@/lib/types';

const COLUMNS = ['Product', 'SKU', 'Category', 'Brand', 'Price (₹)', 'Stock', 'Status', 'Last Updated', 'Actions'];

function Thumb({ product }: { product: Product }) {
  if (!product.primaryImage) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-neutral-50 text-[10px] text-neutral-400">
        N/A
      </span>
    );
  }
  return (
    // Images are served from the backend's /static mount, not the Next image pipeline.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.primaryImage}
      alt={product.name}
      loading="lazy"
      className="h-11 w-11 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-0.5"
    />
  );
}

interface Props {
  products: Product[];
  loading: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

export default function ProductTable({ products, loading, selected, onToggle, onToggleAll }: Props) {
  const router = useRouter();
  const allSelected = products.length > 0 && products.every((p) => selected.has(p._id));

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-14 text-center">
        <p className="text-[15px] font-semibold text-neutral-800">No products yet</p>
        <p className="mt-1 text-sm text-neutral-500">
          Use <span className="font-medium text-neutral-700">Import</span> to upload your Excel sheet
          and the matching images ZIP.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] border-collapse text-left">
        <thead>
          <tr className="border-b border-neutral-200 text-[12px] font-semibold uppercase tracking-wide text-neutral-500">
            <th className="w-12 px-4 py-3.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all products on this page"
                className="h-4 w-4 cursor-pointer accent-[#FFC107]"
              />
            </th>
            {COLUMNS.map((c) => (
              <th key={c} className="px-4 py-3.5 font-semibold whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {products.map((p) => {
            const updated = formatDateTime(p.updatedAt);
            const href = `/products/${p._id}`;
            return (
              <tr
                key={p._id}
                onClick={() => router.push(href)}
                className="cursor-pointer border-b border-neutral-100 text-[13.5px] transition hover:bg-neutral-50"
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(p._id)}
                    onChange={() => onToggle(p._id)}
                    aria-label={`Select ${p.name}`}
                    className="h-4 w-4 cursor-pointer accent-[#FFC107]"
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb product={p} />
                    <span className="min-w-0">
                      <Link
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-semibold text-[#1D4ED8] hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="block text-[12px] text-neutral-500">{p.weight || '—'}</span>
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 font-medium text-neutral-700">{p.sku}</td>

                <td className="px-4 py-3">
                  <span className="block text-neutral-800">{p.category || '—'}</span>
                  {p.subCategory && (
                    <span className="block text-[12px] text-neutral-500">
                      {'> '}
                      {p.subCategory}
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-neutral-700">{p.brand || '—'}</td>

                <td className="px-4 py-3">
                  <span className="font-semibold text-neutral-900">{inr(p.price)}</span>
                  {p.mrp > p.price && (
                    <span className="ml-1.5 text-[12px] text-neutral-400 line-through">
                      {inr(p.mrp)}
                    </span>
                  )}
                </td>

                <td
                  className={`px-4 py-3 font-semibold ${
                    p.stock === 0 ? 'text-rose-600' : p.stock <= 10 ? 'text-amber-600' : 'text-neutral-800'
                  }`}
                >
                  {p.stock}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS_CLASS[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                  <span className="block">{updated.date}</span>
                  <span className="block text-[12px] text-neutral-400">{updated.time}</span>
                </td>

                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span className="cursor-not-allowed p-1.5" title="Edit (disabled)">
                      <IconPencil width={17} height={17} />
                    </span>
                    <span className="cursor-not-allowed p-1.5" title="Duplicate (disabled)">
                      <IconCopy width={17} height={17} />
                    </span>
                    <span className="cursor-not-allowed p-1.5" title="More (disabled)">
                      <IconDots width={17} height={17} />
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconChevronLeft } from '@/components/Icons';
import { STATUS_CLASS, STATUS_LABEL, fetchProduct, formatDateTime, inr } from '@/lib/api';
import type { Product } from '@/lib/types';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-2.5 last:border-0">
      <dt className="text-[13px] text-neutral-500">{label}</dt>
      <dd className="text-right text-[13.5px] font-semibold text-neutral-800">{value || '-'}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchProduct(id);
        if (!cancelled) {
          setProduct(res.data);
          setActive(0);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="h-[420px] animate-pulse rounded-2xl bg-neutral-200" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
        <p className="text-[15px] font-semibold text-rose-700">Product not found</p>
        <p className="mt-1.5 text-[13.5px] text-neutral-500">{error}</p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-xl bg-[#FFD500] px-4 py-2.5 text-[13.5px] font-bold text-neutral-900 hover:bg-[#f5cd00]"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const updated = formatDateTime(product.updatedAt);
  const created = formatDateTime(product.createdAt);
  const savings = product.mrp - product.price;
  const gallery = product.images;
  const current = gallery[active];

  return (
    <div className="space-y-5">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-neutral-600 hover:text-neutral-900"
      >
        <IconChevronLeft width={16} height={16} />
        Back to Products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
            {[product.category, product.subCategory, product.subSubCategory]
              .filter(Boolean)
              .join('  >  ')}
          </p>
          <h1 className="mt-1.5 text-[28px] font-bold leading-tight text-neutral-900">
            {product.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-neutral-500">
            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-700">
              SKU {product.sku}
            </span>
            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 font-mono text-[12px] text-neutral-700">
              {product.barcode}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS_CLASS[product.status]}`}
            >
              {STATUS_LABEL[product.status]}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[30px] font-bold leading-none text-neutral-900">{inr(product.price)}</p>
          {savings > 0 && (
            <p className="mt-1.5 text-[13px] text-neutral-500">
              <span className="line-through">{inr(product.mrp)}</span>
              <span className="ml-2 font-semibold text-emerald-600">
                Save {inr(savings)} ({product.margin}%)
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Gallery */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          {current ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={`${product.name} image ${active + 1}`}
                className="h-[360px] w-full rounded-xl bg-neutral-50 object-contain"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {gallery.map((img, i) => (
                  <button
                    key={img.filename}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white transition ${
                      i === active ? 'border-[#FFC107]' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain p-0.5"
                    />
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-neutral-400">
                {gallery.length} image{gallery.length === 1 ? '' : 's'} from ZIP folder{' '}
                <span className="font-semibold text-neutral-600">images/{product.srNo}/</span>
              </p>
            </>
          ) : (
            <div className="grid h-[360px] place-items-center rounded-xl bg-neutral-50 text-[13.5px] text-neutral-400">
              No images were found in folder {product.srNo}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-2 text-[15px] font-bold text-neutral-900">Product details</h2>
            <dl>
              <Row label="SR. NO. (Excel row)" value={product.srNo} />
              <Row label="Brand" value={product.brand} />
              <Row label="Category" value={product.category} />
              <Row label="Sub category" value={product.subCategory} />
              <Row label="Sub sub category" value={product.subSubCategory} />
              <Row label="Weight / pack size" value={product.weight} />
              <Row label="Description" value={product.description} />
            </dl>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-2 text-[15px] font-bold text-neutral-900">Pricing &amp; stock</h2>
            <dl>
              <Row label="MRP" value={inr(product.mrp)} />
              <Row label="Selling price" value={inr(product.price)} />
              <Row label="Margin" value={`${product.margin}%`} />
              <Row label="Delivery charge" value={inr(product.deliveryCharge)} />
              <Row label="Stock on hand" value={`${product.stock} units`} />
              <Row
                label="Status"
                value={
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] ${STATUS_CLASS[product.status]}`}
                  >
                    {STATUS_LABEL[product.status]}
                  </span>
                }
              />
            </dl>
          </div>

          {product.slabs.length > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 text-[15px] font-bold text-neutral-900">Bulk pricing slabs</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[380px] text-left text-[13.5px]">
                  <thead>
                    <tr className="border-b border-neutral-200 text-[12px] uppercase tracking-wide text-neutral-500">
                      <th className="py-2 font-semibold">Tier</th>
                      <th className="py-2 font-semibold">Quantity</th>
                      <th className="py-2 font-semibold">Price</th>
                      <th className="py-2 font-semibold">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.slabs.map((s) => (
                      <tr key={s.tier} className="border-b border-neutral-100 last:border-0">
                        <td className="py-2.5 font-semibold text-neutral-700">{s.tier}</td>
                        <td className="py-2.5">{s.quantity ?? '-'}</td>
                        <td className="py-2.5">{s.price === null ? '-' : inr(s.price)}</td>
                        <td className="py-2.5">{s.margin === null ? '-' : `${s.margin}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-2 text-[15px] font-bold text-neutral-900">Record</h2>
            <dl>
              <Row label="Imported" value={`${created.date}, ${created.time}`} />
              <Row label="Last updated" value={`${updated.date}, ${updated.time}`} />
              <Row label="Images linked" value={gallery.length} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

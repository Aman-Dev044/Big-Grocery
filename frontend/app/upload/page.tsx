'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import FileDropZone from '@/components/FileDropZone';
import {
  IconArrowRight,
  IconCheck,
  IconFileSheet,
  IconFileZip,
  IconLock,
  IconRefresh,
  IconWarn,
} from '@/components/Icons';
import { ApiError, uploadBulk } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { UploadResult } from '@/lib/types';

type Step = 'select' | 'processing' | 'done';

const STEPS: { key: Step; label: string }[] = [
  { key: 'select', label: 'Choose files' },
  { key: 'processing', label: 'Process & map' },
  { key: 'done', label: 'Done' },
];

function Stepper({ step }: { step: Step }) {
  const index = STEPS.findIndex((s) => s.key === step);

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < index;
        const active = i === index;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                active
                  ? 'bg-[#FFD500] text-neutral-900'
                  : done
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                  active
                    ? 'bg-neutral-900 text-white'
                    : done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-300 text-white'
                }`}
              >
                {done ? <IconCheck width={12} height={12} /> : i + 1}
              </span>
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-neutral-200" />}
          </li>
        );
      })}
    </ol>
  );
}

function SummaryTile({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'good' | 'warn';
}) {
  const tones = {
    neutral: 'bg-neutral-50 text-neutral-900',
    good: 'bg-emerald-50 text-emerald-800',
    warn: 'bg-amber-50 text-amber-800',
  };
  return (
    <div className={`rounded-xl px-4 py-3.5 ${tones[tone]}`}>
      <p className="text-[22px] font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12.5px] opacity-80">{label}</p>
    </div>
  );
}

export default function UploadPage() {
  const { admin, ready } = useAuth();
  const router = useRouter();

  const [excel, setExcel] = useState<File | null>(null);
  const [zip, setZip] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />;
  }

  if (!admin) {
    return (
      <div className="mx-auto max-w-[460px] rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF3C4]">
          <IconLock className="text-[#B45309]" width={26} height={26} />
        </span>
        <h1 className="mt-4 text-[19px] font-bold text-neutral-900">Admin login required</h1>
        <p className="mt-1.5 text-[13.5px] text-neutral-500">
          Use the <span className="font-semibold text-neutral-700">Admin Login</span> button in the
          top bar to sign in, then come back here to import products.
        </p>
      </div>
    );
  }

  async function proceed() {
    if (!excel || !zip) return;
    setStep('processing');
    setError('');
    try {
      const res = await uploadBulk(excel, zip, replaceExisting);
      setResult(res.data);
      setStep('done');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Your session expired. Please log in again.'
          : err instanceof Error
            ? err.message
            : 'Upload failed'
      );
      setStep('select');
    }
  }

  function reset() {
    setExcel(null);
    setZip(null);
    setResult(null);
    setError('');
    setStep('select');
  }

  const busy = step === 'processing';

  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-neutral-900">Bulk Upload</h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          Upload the product sheet and the images archive. Each{' '}
          <span className="font-semibold text-neutral-700">SR. NO.</span> is matched to the
          same-numbered folder inside the ZIP.
        </p>
      </div>

      <Stepper step={step} />

      {step === 'done' && result ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <IconCheck width={24} height={24} />
            </span>
            <div>
              <h2 className="text-[18px] font-bold text-neutral-900">Import complete</h2>
              <p className="mt-0.5 text-[13.5px] text-neutral-500">
                {result.productsCreated} products and {result.imagesLinked} images are now in the
                database, finished in {(result.durationMs / 1000).toFixed(2)}s.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryTile label="Rows read" value={result.totalRows} />
            <SummaryTile label="Products created" value={result.productsCreated} tone="good" />
            <SummaryTile label="Images mapped" value={result.imagesLinked} tone="good" />
            <SummaryTile label="ZIP folders" value={result.zipFolders} />
            <SummaryTile
              label="Folders with no row"
              value={result.unmatchedFolders.length}
              tone={result.unmatchedFolders.length ? 'warn' : 'neutral'}
            />
            <SummaryTile
              label="Rows with no images"
              value={result.rowsWithoutImages.length}
              tone={result.rowsWithoutImages.length ? 'warn' : 'neutral'}
            />
          </div>

          {result.warnings.length > 0 && (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3.5">
              <p className="flex items-center gap-2 text-[13px] font-bold text-amber-800">
                <IconWarn width={16} height={16} />
                Warnings
              </p>
              <ul className="mt-2 space-y-1.5 text-[12.5px] text-amber-800">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-[14px] font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <IconRefresh width={17} height={17} />
              Import another
            </button>
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="flex items-center gap-2 rounded-xl bg-[#FFD500] px-5 py-2.5 text-[14px] font-bold text-neutral-900 hover:bg-[#f5cd00]"
            >
              View products
              <IconArrowRight width={17} height={17} />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FileDropZone
              title="Product sheet"
              hint="Excel file — first sheet, headers on row 1"
              extensions={['.xlsx', '.xls']}
              icon={<IconFileSheet width={26} height={26} />}
              accent="bg-[#E8F5EC] text-[#15803D]"
              file={excel}
              disabled={busy}
              onPick={setExcel}
            />
            <FileDropZone
              title="Images archive"
              hint="ZIP with folders 1, 2, 3 ... one per SR. NO."
              extensions={['.zip']}
              icon={<IconFileZip width={26} height={26} />}
              accent="bg-[#EAF1FE] text-[#1D4ED8]"
              file={zip}
              disabled={busy}
              onPick={setZip}
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl bg-neutral-50 px-4 py-3.5">
            <input
              type="checkbox"
              checked={replaceExisting}
              disabled={busy}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#FFC107]"
            />
            <span className="text-[13px] text-neutral-700">
              <span className="font-semibold">Replace the existing catalogue</span>
              <span className="block text-neutral-500">
                Removes products and images from earlier imports. Uncheck to add alongside them.
              </span>
            </span>
          </label>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-neutral-500">
              {excel && zip
                ? 'Both files ready — click Proceed to import.'
                : 'Select both files to continue.'}
            </p>

            <div className="flex items-center gap-2.5">
              <Link
                href="/products"
                className="rounded-xl border border-neutral-300 px-4 py-2.5 text-[14px] font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={proceed}
                disabled={busy || !excel || !zip}
                className="flex items-center gap-2 rounded-xl bg-[#FFD500] px-6 py-2.5 text-[14px] font-bold text-neutral-900 transition hover:bg-[#f5cd00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900/30 border-t-neutral-900" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed
                    <IconArrowRight width={17} height={17} />
                  </>
                )}
              </button>
            </div>
          </div>

          {busy && (
            <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-[13px] text-blue-800">
              Unzipping the archive, reading the sheet and mapping images to products. Large
              archives can take a minute — please keep this tab open.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

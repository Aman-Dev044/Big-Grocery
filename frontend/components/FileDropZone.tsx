'use client';

import { useRef, useState, type DragEvent } from 'react';
import { formatBytes } from '@/lib/api';
import { IconCheck, IconUpload } from './Icons';

interface Props {
  title: string;
  hint: string;
  /** Lower-case extensions this zone accepts, e.g. ['.xlsx', '.xls'] */
  extensions: string[];
  icon: React.ReactNode;
  accent: string;
  file: File | null;
  disabled?: boolean;
  onPick: (file: File | null) => void;
}

export default function FileDropZone({
  title,
  hint,
  extensions,
  icon,
  accent,
  file,
  disabled,
  onPick,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');

  function accept(candidate: File | null | undefined) {
    if (!candidate) return;
    const name = candidate.name.toLowerCase();
    if (!extensions.some((ext) => name.endsWith(ext))) {
      setError(`That is not a ${extensions.join(' / ')} file.`);
      return;
    }
    setError('');
    onPick(candidate);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    accept(e.dataTransfer.files?.[0]);
  }

  const state = file
    ? 'border-emerald-300 bg-emerald-50/50'
    : over
      ? 'border-[#FFC107] bg-[#FFFBEB]'
      : 'border-neutral-300 bg-white hover:border-neutral-400';

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${state} ${
          disabled ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <span
          className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${
            file ? 'bg-emerald-100 text-emerald-700' : accent
          }`}
        >
          {file ? <IconCheck width={26} height={26} /> : icon}
        </span>

        <p className="mt-3 text-[15px] font-bold text-neutral-900">{title}</p>

        {file ? (
          <>
            <p className="mx-auto mt-1.5 max-w-[260px] truncate text-[13.5px] font-medium text-neutral-700">
              {file.name}
            </p>
            <p className="text-[12.5px] text-neutral-500">{formatBytes(file.size)}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  onPick(null);
                  setError('');
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1.5 text-[13px] text-neutral-500">{hint}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-xl bg-neutral-900 px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-neutral-800"
            >
              Browse files
            </button>
            <p className="mt-2 text-[12px] text-neutral-400">or drag &amp; drop it here</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={extensions.join(',')}
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-2 text-[12.5px] font-medium text-rose-600">{error}</p>}
    </div>
  );
}

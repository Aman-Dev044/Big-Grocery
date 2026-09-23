'use client';

import { useEffect, useState } from 'react';
import { IconTrash, IconWarn } from './Icons';

interface Props {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  /** When set, the confirm button stays locked until this word is typed exactly. */
  requireTyped?: string;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Blocking confirmation for destructive actions. `requireTyped` adds a
 * type-the-word gate for the irreversible ones.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  requireTyped,
  busy,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  const locked = Boolean(requireTyped) && typed.trim() !== requireTyped;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/45 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[460px] overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start gap-3 px-6 pt-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
            <IconWarn width={22} height={22} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-[17px] font-bold text-neutral-900">
              {title}
            </h2>
            <div className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-600">{message}</div>
          </div>
        </div>

        {requireTyped && (
          <div className="px-6 pt-4">
            <label htmlFor="confirm-word" className="mb-1.5 block text-[13px] text-neutral-600">
              Type <span className="font-bold text-neutral-900">{requireTyped}</span> to confirm
            </label>
            <input
              id="confirm-word"
              autoFocus
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTyped}
              className="h-[46px] w-full rounded-xl border border-neutral-200 bg-white px-4 text-[14px] tracking-wide text-neutral-800 outline-none focus:border-rose-400"
            />
          </div>
        )}

        {error && (
          <p role="alert" className="mx-6 mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2.5 bg-neutral-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || locked}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Deleting...
              </>
            ) : (
              <>
                <IconTrash width={16} height={16} />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

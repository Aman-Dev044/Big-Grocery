'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { IconEye, IconEyeOff, IconLock, IconMail } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: Props) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Reset whenever the dialog is reopened, and close it with Escape.
  useEffect(() => {
    if (!open) return;
    setError('');
    setBusy(false);
    setShowPassword(false);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      setEmail('');
      setPassword('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="border-b border-neutral-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFD500]">
              <IconLock className="text-neutral-900" />
            </span>
            <div>
              <h2 id="login-title" className="text-[17px] font-bold text-neutral-900">
                Admin Login
              </h2>
              <p className="text-[13px] text-neutral-500">
                Sign in to import products and manage the catalogue.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
              Email
            </label>
            <div className="relative">
              <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="admin-email"
                type="email"
                required
                autoFocus
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@grocery.com"
                className="h-[46px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-[14px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#FFC107]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
              Password
            </label>
            <div className="relative">
              <IconLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-[46px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-12 text-[14px] text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#FFC107]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
              >
                {showPassword ? <IconEyeOff width={18} height={18} /> : <IconEye width={18} height={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-neutral-300 px-4 py-2.5 text-[14px] font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !email || !password}
              className="rounded-xl bg-[#FFD500] px-6 py-2.5 text-[14px] font-bold text-neutral-900 transition hover:bg-[#f5cd00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

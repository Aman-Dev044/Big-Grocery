'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { IconEye, IconEyeOff, IconLock, IconMail } from '@/components/Icons';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { admin, ready, signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Already signed in? Skip the form.
  useEffect(() => {
    if (ready && admin) router.replace('/dashboard');
  }, [ready, admin, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#FFD500] p-10 lg:flex">
        <div className="scale-110 origin-top-left">
          <Logo />
        </div>

        <div className="relative z-10 max-w-[420px]">
          <h2 className="text-[34px] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
            Good Food,
            <br />
            Happier Families,
            <br />
            Always.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-neutral-800/75">
            Import your whole catalogue in one go — one Excel sheet, one ZIP of photos. Products and
            images are matched automatically by serial number.
          </p>
          <span className="mt-6 block h-1 w-16 rounded bg-neutral-900/25" />
        </div>

        <p className="relative z-10 text-[13px] font-semibold text-neutral-800/60">
          Har Ghar Ki Pasand
        </p>

        {/* Soft decorative wash — purely ornamental */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-white/25"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-[360px] w-[360px] rounded-full bg-white/15"
        />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-[#f6f7f9] px-5 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFD500]">
            <IconLock className="text-neutral-900" width={24} height={24} />
          </span>

          <h1 className="mt-4 text-[26px] font-bold leading-tight text-neutral-900">Admin Login</h1>
          <p className="mt-1.5 text-[14px] text-neutral-500">
            Sign in to manage the store catalogue.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
                Email
              </label>
              <div className="relative">
                <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@grocery.com"
                  className="h-[50px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-[14px] text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFD500]/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
                Password
              </label>
              <div className="relative">
                <IconLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-[50px] w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-12 text-[14px] text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFD500]/20"
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

            <button
              type="submit"
              disabled={busy || !email || !password}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-[#FFD500] text-[15px] font-bold text-neutral-900 transition hover:bg-[#f5cd00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900/30 border-t-neutral-900" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-neutral-500">
            <Link href="/products" className="font-semibold text-neutral-700 hover:underline">
              Back to products
            </Link>
          </p>

          <p className="mt-2 text-center text-[12px] text-neutral-400">
            Big Bannia Di Hatti — Store Admin
          </p>
        </div>
      </div>
    </div>
  );
}

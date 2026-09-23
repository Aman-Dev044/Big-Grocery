'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import { TAGLINES } from '@/components/TaglineStrip';
import { IconCheck, IconEye, IconEyeOff, IconLock, IconMail } from '@/components/Icons';
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
    if (ready && admin) router.replace('/products');
  }, [ready, admin, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setBusy(false);
    }
  }

  return (
    <div className="grid h-dvh overflow-hidden lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-[#FFD500] px-10 py-8 lg:flex">
        {/* Soft decorative wash — purely ornamental */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full bg-white/[0.18]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-52 -left-40 h-[520px] w-[520px] rounded-full bg-white/[0.10]"
        />

        {/* One wide column, everything hanging off a single left edge — the
            square logo badge, the heading, and the promise grid. */}
        <div className="relative z-10 w-full max-w-[640px]">
          {/* A square badge, sized in itself rather than stretched to the
              column width. Centred, then nudged left so it sits over the start
              of the heading rather than floating in the middle — tune the
              translate value to taste. */}
          <div className="mx-auto -translate-x-[72px] grid h-[240px] w-[240px] place-items-center rounded-[28px] bg-white shadow-[0_22px_50px_-28px_rgba(0,0,0,0.5)] xl:h-[264px] xl:w-[264px]">
            <Logo width={196} priority className="xl:hidden" />
            <Logo width={216} priority className="hidden xl:block" />
          </div>

          {/* Both of these stay on one line. The brand panel is half the
              viewport, so the type is sized off the width it actually gets:
              (50vw - the panel's 80px of padding) divided by the line's length
              in ems, clamped so it never gets silly at either extreme. */}
          <h2
            className="mt-8 whitespace-nowrap font-extrabold leading-[1.18] tracking-tight text-neutral-900"
            style={{ fontSize: 'clamp(17px, calc((50vw - 80px) / 21), 30px)' }}
          >
            Good Food, Happier Families, Always.
          </h2>

          <p
            className="mt-3 whitespace-nowrap leading-relaxed text-neutral-900/60"
            style={{ fontSize: 'clamp(11px, calc((50vw - 80px) / 34), 15px)' }}
          >
            One Excel sheet, one ZIP — matched automatically by serial number.
          </p>

          <p className="mt-7 text-[10.5px] font-bold tracking-[0.18em] text-neutral-900/45">
            WHY BIG BANNIA DI HATTI
          </p>

          {/* Two columns so the promises fill the panel's width instead of
              leaving a long empty rule beside each short line. An odd last
              item spans both columns, so no row ends on a half rule. */}
          <ul className="mt-3 grid grid-cols-2 gap-x-7">
            {TAGLINES.map((line, i) => {
              const spans = i === TAGLINES.length - 1 && TAGLINES.length % 2 === 1;
              return (
                <li
                  key={line}
                  className={`flex items-center gap-3 border-b border-neutral-900/10 py-2.5 ${
                    spans ? 'col-span-2' : ''
                  }`}
                >
                  <span
                    aria-hidden
                    className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full bg-neutral-900 text-[#FFD500]"
                  >
                    <IconCheck width={11} height={11} />
                  </span>
                  <span className="text-[13px] font-semibold leading-snug text-neutral-900/80">
                    {line}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 text-[11px] font-bold tracking-[0.18em] text-neutral-900/40">
            HAR GHAR KI PASAND
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center overflow-y-auto bg-[#f6f7f9] px-5 py-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 lg:hidden">
            <Logo width={240} priority />
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

          <p className="mt-6 text-center text-[12px] text-neutral-400">
            Big Bannia Di Hatti — Store Admin
          </p>
        </div>
      </div>
    </div>
  );
}

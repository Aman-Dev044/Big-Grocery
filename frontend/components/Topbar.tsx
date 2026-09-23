'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { IconBell, IconChevronDown, IconLock, IconLogout, IconSearch, IconUser } from './Icons';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/upload': 'Bulk Upload',
};

export default function Topbar() {
  const { admin, ready, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const title = TITLES[pathname] || (pathname.startsWith('/products/') ? 'Product details' : '');

  return (
    <header className="sticky top-0 z-30 flex h-[74px] items-center gap-4 border-b border-neutral-200 bg-white px-6">
      <p className="hidden shrink-0 text-[15px] font-semibold text-neutral-800 md:block">{title}</p>

      <div className="relative mx-auto w-full max-w-[420px]">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          disabled
          placeholder="Search for products, orders, customers..."
          className="h-11 w-full cursor-not-allowed rounded-full border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm text-neutral-600 placeholder:text-neutral-400"
        />
      </div>

      <button
        type="button"
        disabled
        className="relative grid h-10 w-10 shrink-0 cursor-not-allowed place-items-center text-neutral-500"
      >
        <IconBell />
        <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-[#E2231A] text-[10px] font-bold text-white">
          3
        </span>
      </button>

      {!ready ? (
        <span className="h-10 w-[132px] shrink-0 animate-pulse rounded-xl bg-neutral-100" />
      ) : admin ? (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-neutral-50"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FFD500] text-[13px] font-bold text-neutral-800">
              {initials(admin?.name || 'A')}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[14px] font-semibold text-neutral-900">{admin?.name}</span>
              <span className="block text-[12px] text-neutral-500">Store Owner</span>
            </span>
            <IconChevronDown className="text-neutral-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[236px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              <div className="border-b border-neutral-100 px-4 py-3">
                <p className="flex items-center gap-2 text-[13.5px] font-semibold text-neutral-800">
                  <IconUser width={16} height={16} className="text-neutral-400" />
                  {admin?.name}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-neutral-500">{admin?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                  router.replace('/products');
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13.5px] font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <IconLogout width={17} height={17} />
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FFD500] px-4 py-2.5 text-[13.5px] font-bold text-neutral-900 transition hover:bg-[#f5cd00]"
        >
          <IconLock width={17} height={17} />
          Admin Login
        </Link>
      )}
    </header>
  );
}

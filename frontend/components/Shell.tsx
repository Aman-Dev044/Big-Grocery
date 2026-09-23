'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '@/lib/auth';

/** Only these need an admin. Everything else is browsable signed out. */
const PROTECTED_ROUTES = ['/dashboard', '/upload'];

const isProtected = (pathname: string) =>
  PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

/**
 * Wraps every page: renders the login route bare, gives everything else the
 * sidebar + top bar, and sends signed-out visitors to /login only when they
 * actually open an admin-only page.
 */
export default function Shell({ children }: { children: ReactNode }) {
  const { admin, ready } = useAuth();
  const pathname = usePathname() || '';
  const router = useRouter();

  const needsAdmin = isProtected(pathname);

  useEffect(() => {
    if (ready && !admin && needsAdmin) router.replace('/login');
  }, [ready, admin, needsAdmin, router]);

  // The login page owns the full viewport — no chrome around it.
  if (pathname === '/login') return <>{children}</>;

  const blocked = needsAdmin && (!ready || !admin);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6">
          {blocked ? (
            <div className="grid min-h-[60vh] place-items-center">
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-300 border-t-[#FFD500]" />
                <p className="text-[13px] text-neutral-500">
                  {ready ? 'Redirecting to login...' : 'Checking your session...'}
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

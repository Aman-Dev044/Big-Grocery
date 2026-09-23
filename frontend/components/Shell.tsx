'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import Sidebar from './Sidebar';
import TaglineStrip from './TaglineStrip';
import Topbar from './Topbar';
import { useAuth } from '@/lib/auth';

/** This is an admin panel — everything but the login page needs a signed-in admin. */
const PUBLIC_ROUTES = ['/login'];

export default function Shell({ children }: { children: ReactNode }) {
  const { admin, ready } = useAuth();
  const pathname = usePathname() || '';
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (ready && !admin && !isPublic) router.replace('/login');
  }, [ready, admin, isPublic, router]);

  // The login page owns the full viewport — no sidebar, no top bar.
  if (isPublic) return <>{children}</>;

  // Session still resolving, or already on the way to /login.
  if (!ready || !admin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f7f9]">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-neutral-300 border-t-[#FFD500]" />
          <p className="text-[13px] text-neutral-500">
            {ready ? 'Redirecting to login...' : 'Checking your session...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="px-6 pb-6">
          <TaglineStrip />
        </footer>
      </div>
    </div>
  );
}

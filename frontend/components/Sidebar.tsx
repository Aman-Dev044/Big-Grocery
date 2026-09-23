'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { useAuth } from '@/lib/auth';
import {
  IconChart, IconDashboard, IconDoc, IconBox, IconGrid, IconInventory,
  IconCart, IconLock, IconSettings, IconStore, IconTag, IconTruck,
  IconUpload, IconUsers,
} from './Icons';

type Item = {
  label: string;
  icon: typeof IconBox;
  href?: string;
  /** Renders with a lock and opens the login dialog until an admin is signed in. */
  requiresAuth?: boolean;
};

// Only "Products" and "Upload" navigate — every other entry is intentionally
// inert, matching the reference design.
const MENU: Item[] = [
  { label: 'Dashboard', icon: IconDashboard },
  { label: 'Products', icon: IconBox, href: '/products' },
  { label: 'Upload', icon: IconUpload, href: '/upload', requiresAuth: true },
  { label: 'Categories', icon: IconGrid },
  { label: 'Inventory', icon: IconInventory },
  { label: 'Purchase Orders', icon: IconDoc },
  { label: 'Sales', icon: IconCart },
  { label: 'Customers', icon: IconUsers },
  { label: 'Suppliers', icon: IconUsers },
  { label: 'Rider Management', icon: IconTruck },
  { label: 'Offers & Discounts', icon: IconTag },
  { label: 'Reports', icon: IconChart },
  { label: 'Store Management', icon: IconStore },
  { label: 'Settings', icon: IconSettings },
];

const ROW = 'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition';

export default function Sidebar({ onRequestLogin }: { onRequestLogin: () => void }) {
  const { admin } = useAuth();
  const pathname = usePathname() || '';

  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
      <Logo />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {MENU.map(({ label, icon: Icon, href, requiresAuth }) => {
          // Inert entry.
          if (!href) {
            return (
              <span
                key={label}
                aria-disabled="true"
                title="Not available in this demo"
                className={`${ROW} cursor-not-allowed select-none text-neutral-400`}
              >
                <Icon className="shrink-0" />
                {label}
              </span>
            );
          }

          // Locked until login — clicking opens the login dialog.
          if (requiresAuth && !admin) {
            return (
              <button
                key={label}
                type="button"
                onClick={onRequestLogin}
                title="Admin login required"
                className={`${ROW} text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800`}
              >
                <Icon className="shrink-0" />
                {label}
                <IconLock width={15} height={15} className="ml-auto text-neutral-400" />
              </button>
            );
          }

          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={label}
              href={href}
              className={`${ROW} ${
                active
                  ? 'bg-[#FFD84A] text-neutral-900 shadow-sm hover:bg-[#ffd22e]'
                  : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Icon className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 overflow-hidden rounded-2xl bg-[#FFF6DC] p-4">
        <p className="text-[15px] font-semibold leading-snug text-neutral-800">
          Good Food
          <br />
          Happier Families
          <br />
          Always
        </p>
        <span className="mt-2 block h-[3px] w-10 rounded bg-[#FFC107]" />
      </div>
    </aside>
  );
}

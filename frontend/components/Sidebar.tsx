'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';
import TaglineStrip from './TaglineStrip';
import { useAuth } from '@/lib/auth';
import {
  IconChart, IconDoc, IconBox, IconGrid, IconInventory,
  IconCart, IconLogout, IconSettings, IconStore, IconTag,
  IconTruck, IconUpload, IconUsers,
} from './Icons';

type Item = { label: string; icon: typeof IconBox; href?: string };

// The live destinations, in the order the store owner works through them.
// The sidebar only ever renders for a signed-in admin.
const PRIMARY: Item[] = [
  { label: 'Products', icon: IconBox, href: '/products' },
  { label: 'Upload', icon: IconUpload, href: '/upload' },
];

// Shown for completeness, deliberately inert.
const SECONDARY: Item[] = [
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

export default function Sidebar() {
  const pathname = usePathname() || '';
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
      <div className="flex justify-center px-5 pb-4 pt-5">
        <Logo width={132} priority />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        <div className="space-y-0.5">
          {PRIMARY.map(({ label, icon: Icon, href }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={label}
                href={href as string}
                aria-current={active ? 'page' : undefined}
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
        </div>

        <p className="px-3.5 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          More
        </p>

        <div className="space-y-0.5">
          {SECONDARY.map(({ label, icon: Icon }) => (
            <span
              key={label}
              aria-disabled="true"
              title="Not available in this demo"
              className={`${ROW} cursor-not-allowed select-none text-neutral-400`}
            >
              <Icon className="shrink-0" />
              {label}
            </span>
          ))}
        </div>
      </nav>

      <div className="mx-3 mb-3 rounded-2xl bg-[#FFF6DC] p-4">
        <TaglineStrip variant="stack" />
      </div>

      <div className="border-t border-neutral-200 p-3">
        <button
          type="button"
          onClick={() => {
            signOut();
            router.replace('/login');
          }}
          className={`${ROW} text-rose-600 hover:bg-rose-50`}
        >
          <IconLogout className="shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}

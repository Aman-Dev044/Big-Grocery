import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
};

export const IconBox = (p: P) => (
  <svg {...base} {...p}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></svg>
);
export const IconGrid = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const IconInventory = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h2M7 17h2" /></svg>
);
export const IconDoc = (p: P) => (
  <svg {...base} {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></svg>
);
export const IconCart = (p: P) => (
  <svg {...base} {...p}><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.6 12h11L21 7H6" /></svg>
);
export const IconUsers = (p: P) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16.5 5.2a3.2 3.2 0 0 1 0 5.6" /><path d="M18 14.5a6.4 6.4 0 0 1 3.5 5.5" /></svg>
);
export const IconTruck = (p: P) => (
  <svg {...base} {...p}><path d="M3 16V6h11v10" /><path d="M14 9h4l3 3.5V16h-7" /><circle cx="7.5" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></svg>
);
export const IconTag = (p: P) => (
  <svg {...base} {...p}><path d="M20.5 12.5 12 21l-9-9V3h9l8.5 8.5Z" /><circle cx="7.5" cy="7.5" r="1.3" /></svg>
);
export const IconChart = (p: P) => (
  <svg {...base} {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const IconStore = (p: P) => (
  <svg {...base} {...p}><path d="M4 9h16v11H4z" /><path d="M3 9l1.5-5h15L21 9" /><path d="M9 20v-6h6v6" /></svg>
);
export const IconSettings = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V20a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 18.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4 13H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5.6 6.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H20a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const IconBell = (p: P) => (
  <svg {...base} {...p}><path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" /><path d="M10.5 20a2 2 0 0 0 3 0" /></svg>
);
export const IconChevronDown = (p: P) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
);
export const IconUpload = (p: P) => (
  <svg {...base} {...p}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
);
export const IconDownload = (p: P) => (
  <svg {...base} {...p}><path d="M12 4v12" /><path d="m7 11 5 5 5-5" /><path d="M4 18v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1" /></svg>
);
export const IconPlus = (p: P) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconPencil = (p: P) => (
  <svg {...base} {...p}><path d="M4 20h4L20 8l-4-4L4 16v4Z" /><path d="m14 6 4 4" /></svg>
);
export const IconCopy = (p: P) => (
  <svg {...base} {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></svg>
);
export const IconDots = (p: P) => (
  <svg {...base} {...p}><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></svg>
);
export const IconTrash = (p: P) => (
  <svg {...base} {...p}><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13h10l1-13" /></svg>
);
export const IconFilter = (p: P) => (
  <svg {...base} {...p}><path d="M3 5h18l-7 8v6l-4 2v-8Z" /></svg>
);
export const IconList = (p: P) => (
  <svg {...base} {...p}><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg>
);
export const IconTarget = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconFolder = (p: P) => (
  <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
);
export const IconEyeOff = (p: P) => (
  <svg {...base} {...p}><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M6.7 6.7C4.6 8 3 10 2 12c2 4 6 7 10 7 1.7 0 3.3-.5 4.7-1.3" /><path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c4 0 8 3 10 7a16 16 0 0 1-3.2 4.1" /></svg>
);
export const IconDot = (p: P) => (
  <svg {...p} viewBox="0 0 24 24" width={20} height={20} fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
);
export const IconBars = (p: P) => (
  <svg {...p} viewBox="0 0 24 24" width={28} height={28} fill="currentColor"><rect x="3" y="14" width="4" height="7" rx="1" opacity=".9" /><rect x="10" y="10" width="4" height="11" rx="1" opacity=".7" /><rect x="17" y="5" width="4" height="16" rx="1" opacity=".5" /></svg>
);
export const IconArrowUp = (p: P) => (
  <svg {...base} {...p} width={14} height={14}><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></svg>
);
export const IconEye = (p: P) => (
  <svg {...base} {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconMail = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
);
export const IconLock = (p: P) => (
  <svg {...base} {...p}><rect x="4.5" y="10" width="15" height="10" rx="2" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></svg>
);
export const IconLogout = (p: P) => (
  <svg {...base} {...p}><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 15l3-3-3-3" /><path d="M19 12H10" /></svg>
);
export const IconUser = (p: P) => (
  <svg {...base} {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base} {...p}><path d="m5 12.5 4.5 4.5L19 7" /></svg>
);
export const IconFileSheet = (p: P) => (
  <svg {...base} {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M8.5 12h7M8.5 15.5h7M12 12v7" /></svg>
);
export const IconFileZip = (p: P) => (
  <svg {...base} {...p}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M10.5 5h1.5M10.5 8h1.5M10.5 11h1.5" /><rect x="10" y="14" width="3" height="4" rx="1" /></svg>
);
export const IconArrowRight = (p: P) => (
  <svg {...base} {...p}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>
);
export const IconRefresh = (p: P) => (
  <svg {...base} {...p}><path d="M20 11a8 8 0 1 0-.6 4" /><path d="M20 4v7h-7" /></svg>
);
export const IconWarn = (p: P) => (
  <svg {...base} {...p}><path d="M12 4 2.5 20h19Z" /><path d="M12 10v4.5M12 17.5h.01" /></svg>
);

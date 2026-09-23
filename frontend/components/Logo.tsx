export default function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5 pb-6">
      <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFD500]">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2 3h3l2.6 12h11L21 7H6" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight text-[#E2231A]">BIG</span>
        <span className="block text-[13px] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
          BANNIA
        </span>
        <span className="block text-[13px] font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
          DI HATTI
        </span>
        <span className="mt-1 block border-t border-[#E2231A] pt-0.5 text-[7px] font-semibold tracking-[0.18em] text-neutral-500">
          DEPARTMENTAL STORE
        </span>
      </span>
    </div>
  );
}

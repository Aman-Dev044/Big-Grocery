import Image from 'next/image';

interface Props {
  /** Rendered width in px. Height follows the artwork's 774 x 581 ratio. */
  width?: number;
  className?: string;
  priority?: boolean;
}

const RATIO = 581 / 774;

export default function Logo({ width = 160, className = '', priority = false }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="Big Bannia Di Hatti — Departmental Store"
      width={width}
      height={Math.round(width * RATIO)}
      priority={priority}
      quality={95}
      // `block` is required for `mx-auto` to centre it — next/image renders an
      // inline <img>, on which auto margins do nothing. And no `w-full`: that
      // would override `width` and stretch the logo to fill its container.
      className={`mx-auto block h-auto max-w-full select-none ${className}`}
    />
  );
}

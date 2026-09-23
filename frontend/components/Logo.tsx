import Image from 'next/image';

interface Props {
  /** Rendered width in px. Height follows the artwork's 774 x 581 ratio. */
  width?: number;
  className?: string;
  priority?: boolean;
}

const RATIO = 581 / 774;

export default function Logo({ width = 200, className = '', priority = false }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="Big Bannia Di Hatti — Departmental Store"
      width={width}
      height={Math.round(width * RATIO)}
      priority={priority}
      // Served at ~2x so the artwork stays crisp on retina screens.
      quality={95}
      className={`h-auto w-full max-w-full select-none ${className}`}
    />
  );
}

import type { CSSProperties } from 'react';
import { DISH_PHOTOS, ROUND_DISHES } from '../../lib/media';
import { DishArt } from './DishArt';

/** Top-down menu photograph for a menu.json `visual`; falls back to the vector illustration. */
export function DishPhoto({ visual, alt, className = '', style, sizes = '400px' }: { visual: string; alt: string; className?: string; style?: CSSProperties; sizes?: string }) {
  const base = DISH_PHOTOS[visual];
  if (!base) return <DishArt visual={visual} className={className} style={style} />;
  return (
    <img
      src={`${base}-800.webp`}
      srcSet={`${base}-400.webp 400w, ${base}-800.webp 800w`}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={800}
      height={800}
      className={`${ROUND_DISHES.has(visual) ? 'rounded-full' : 'rounded-[22%]'} object-cover ${className}`}
      style={style}
    />
  );
}

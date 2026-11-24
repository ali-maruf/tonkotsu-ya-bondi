import { useId } from 'react';

/** Bowl-and-steam symbol (proposed identity). */
export function BowlMark({ className = '', steam = true }: { className?: string; steam?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {steam && (
        <path d="M24 6c-4 4.5 4 7.5 0 12.5M32 3c-4.5 5 4.5 8.5 0 15M40 6c-4 4.5 4 7.5 0 12.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      <path d="M8 25h48c0 15-10.5 26-24 26S8 40 8 25Z" fill="currentColor" />
      <rect x="20" y="54" width="24" height="3.5" rx="1.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Wordmark lockup. Mirrors /public/assets/logo-tonkotsuya.svg but uses live web fonts.
 * Proposed identity, pending owner approval of spelling and logo.
 */
export function Logo({ compact = false, tone = 'light' }: { compact?: boolean; tone?: 'light' | 'dark' }) {
  const ink = tone === 'light' ? 'text-washi-50' : 'text-charcoal-950';
  return (
    <span className={`inline-flex items-center gap-2.5 ${ink}`}>
      <BowlMark className={`${compact ? 'h-7 w-7' : 'h-10 w-10'} text-vermilion-600`} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-[0.02em] ${compact ? 'text-[17px]' : 'text-2xl'}`}>TONKOTSU YA</span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="h-px flex-1 bg-vermilion-600" />
          <span className={`font-body font-semibold uppercase ${compact ? 'text-[7.5px] tracking-[0.3em]' : 'text-[9px] tracking-[0.34em]'}`}>Bondi Junction</span>
          <span className="h-px flex-1 bg-vermilion-600" />
        </span>
      </span>
    </span>
  );
}

/** Hanko-style seal: the section seal and the preloader stamp. Rough ink edges via SVG turbulence. */
export function Hanko({ className = '', inked = true }: { className?: string; inked?: boolean }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <filter id={`ink-${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={inked ? 3 : 0} />
        </filter>
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="8" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 1.35" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#ink-${id})`}>
        <rect x="6" y="6" width="88" height="88" rx="16" fill="#D7392B" />
        <rect x="13" y="13" width="74" height="74" rx="10" fill="none" stroke="#FAF8F3" strokeWidth="2.2" />
        <g transform="translate(22 20) scale(0.88)" fill="#FAF8F3" stroke="#FAF8F3">
          <path d="M24 6c-4 4.5 4 7.5 0 12.5M32 3c-4.5 5 4.5 8.5 0 15M40 6c-4 4.5 4 7.5 0 12.5" fill="none" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M8 25h48c0 15-10.5 26-24 26S8 40 8 25Z" stroke="none" />
          <rect x="20" y="54" width="24" height="3.5" rx="1.75" stroke="none" />
        </g>
      </g>
      {inked && <rect x="6" y="6" width="88" height="88" rx="16" fill="#D7392B" opacity="0.5" filter={`url(#grain-${id})`} />}
    </svg>
  );
}

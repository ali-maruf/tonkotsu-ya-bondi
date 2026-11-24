import { useRef } from 'react';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { tokens } from '../../lib/tokens';
import { CssNoren } from './CssNoren';
import { Hanko } from './Brand';

/** Chapter opener band: a CSS 3D noren swings open on scroll to reveal the chapter title. */
export function NorenOpener({ n, title, jp, glyphs, color = tokens.vermilion600, ink = tokens.washi50, tone = 'dark' }: { n: string; title: string; jp: string; glyphs: [string, string]; color?: string; ink?: string; tone?: 'dark' | 'light' }) {
  const { tier } = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, {
    start: 'top 75%',
    end: 'center 45%',
    enabled: tier !== 'static',
    onUpdate: (p) => ref.current?.style.setProperty('--o', String(p)),
  });

  return (
    <div ref={ref} className={`relative flex h-[56svh] items-center justify-center overflow-hidden md:h-[68vh] ${tone === 'dark' ? 'bg-charcoal-950 text-washi-50' : 'bg-broth-100 text-charcoal-950'}`}>
      <div className="relative z-0 flex flex-col items-center text-center" style={{ opacity: 'calc(0.25 + var(--o, 1) * 0.75)', transform: 'scale(calc(0.94 + var(--o, 1) * 0.06))' }}>
        <Hanko className="mb-6 h-12 w-12" />
        <span className="label text-vermilion-400">{n}</span>
        <p className="display mt-3 text-[clamp(2.4rem,7vw,5.5rem)]">{title}</p>
        <span className="jp mt-4 text-lg tracking-[0.4em] opacity-50" aria-hidden="true">
          {jp}
        </span>
      </div>
      {tier !== 'static' && <CssNoren color={color} ink={ink} glyphs={glyphs} />}
    </div>
  );
}

import { useRef, useState } from 'react';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { ChapterHeading } from '../ui/ChapterHeading';
import { CssNoren } from '../ui/CssNoren';
import { FilmStage } from '../ui/FilmStage';
import { SushiPoster } from './posters';
import { SUSHI_FRAMES } from '../../lib/media';
import { tokens } from '../../lib/tokens';

const STEPS = [
  { at: 0.12, label: 'Rolled' },
  { at: 0.45, label: 'Sliced' },
  { at: 0.75, label: 'Served' },
];

/** Chapter 4 (cream, pinned ~220vh): a Higgsfield macro tracking shot glides down the maki as you scroll. */
export function Sushi() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  const film = useRef({ value: 0 });
  const [step, setStep] = useState(pinned ? -1 : 2);
  useScrollProgress(ref, {
    enabled: pinned,
    onUpdate: (p) => {
      ref.current?.style.setProperty('--p', p.toFixed(4));
      ref.current?.style.setProperty('--o', Math.min(1, p / 0.12).toFixed(4));
      film.current.value = Math.min(1, Math.max(0, (p - 0.05) / 0.92));
      let i = -1;
      STEPS.forEach((s, k) => p >= s.at && (i = k));
      setStep(i);
    },
  });

  return (
    <section id="sushi" ref={ref} aria-labelledby="sushi-title" className="relative bg-broth-100 text-charcoal-950" style={{ height: pinned ? '220vh' : undefined }}>
      <div className={`${pinned ? 'sticky top-0' : 'relative'} h-screen-s overflow-hidden`} style={{ perspective: '1000px' }}>
        <FilmStage frames={SUSHI_FRAMES} progress={film.current} enabled={pinned} focusX={0.5} poster={<SushiPoster />} />
        {pinned && <CssNoren color={tokens.charcoal950} ink={tokens.washi50} glyphs={['寿司', '豚骨屋']} />}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgb(243_234_219/0.96),rgb(243_234_219/0.8)_28%,rgb(243_234_219/0)_52%)] md:bg-[linear-gradient(180deg,rgb(243_234_219/0.96),rgb(243_234_219/0.75)_30%,rgb(243_234_219/0)_50%),linear-gradient(270deg,rgb(243_234_219/0.85),rgb(243_234_219/0)_28%)]" />
        <div className="container-x relative z-10 flex h-full flex-col justify-between pb-[calc(var(--bottom-bar-h)+20px)] pt-[calc(var(--header-h)+24px)] md:flex-row md:pb-16">
          <div className="max-w-md" style={pinned ? { transform: 'translateZ(calc((1 - min(1, var(--p, 0) * 4)) * -400px)) rotateX(calc((1 - min(1, var(--p, 0) * 4)) * 30deg))', opacity: 'min(1, var(--p, 0) * 5 - 0.3)' } : undefined}>
            <ChapterHeading n="04" label="Sushi" jp="寿司" tone="light" />
            <h2 id="sushi-title" className="display mt-5 text-[clamp(2.2rem,5.5vw,4.6rem)]">
              Rolled.
              <br />
              Sliced. Served.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-charcoal-950/70">Sushi sits right alongside the ramen, for the table or to take away.</p>
          </div>
          <ol className="flex gap-6 self-start md:flex-col md:self-end md:text-right" aria-label="Sushi steps">
            {STEPS.map((s, i) => (
              <li key={s.label} aria-current={i === step ? 'step' : undefined} className={`flex items-center gap-3 md:justify-end ${i <= step ? 'text-charcoal-950' : 'text-charcoal-950/35'}`}>
                <span className="label text-vermilion-600">0{i + 1}</span>
                <span className="font-display text-xl font-extrabold">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

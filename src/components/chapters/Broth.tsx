import { useMemo, useRef, useState, type RefObject } from 'react';
import { useMotion } from '../../lib/motion';
import { isPlaceholder } from '../../lib/placeholder';
import { useScrollProgress } from '../../lib/scroll';
import { site } from '../../lib/site';
import { ChapterHeading } from '../ui/ChapterHeading';
import { Ph } from '../ui/Ph';
import { Stage } from '../ui/Stage';
import { BrothPoster } from './posters';
import { SCENES, pickSrc } from '../../lib/media';
import { tokens } from '../../lib/tokens';
import type { PhotoSceneProps } from '../three/PhotoScene';

const loadPhoto = () => import('../three/PhotoScene');
const PHASES = ['Bones', 'Simmer', 'Milky'];

const brothShot = (): PhotoSceneProps => ({
  image: pickSrc(SCENES.broth),
  imageAspect: SCENES.broth.aspect,
  depth: SCENES.broth.depth,
  focus: 0.6,
  pointerParallax: 0.02,
  path:
    window.innerWidth / window.innerHeight < 0.8
      ? [
          { at: 0, zoom: 1.0, center: [0.72, 0.55] },
          { at: 1, zoom: 1.08, center: [0.72, 0.45], drift: [0.006, 0.006] },
        ]
      : [
          { at: 0, zoom: 1.04, center: [0.5, 0.5], drift: [0, 0] },
          { at: 0.5, zoom: 1.14, center: [0.68, 0.44], drift: [0.01, -0.006] },
          { at: 1, zoom: 1.26, center: [0.7, 0.36], drift: [-0.012, 0.01] },
        ],
  steam: { rect: [0.47, 0.17, 0.95, 0.3], count: 1100, rise: 0.55, size: 1.3, strength: 1.4 },
  shimmer: [0.45, 0.0, 0.98, 0.25],
  noren: { color: tokens.vermilion600, ink: tokens.washi50, glyphs: ['出汁', '豚骨'], range: [0, 0.12] },
  vignette: 0.4,
  background: tokens.charcoal950,
});
const HOURS = isPlaceholder(site.brothHours) ? null : Number(site.brothHours);

/** Chapter 2: the long simmer. A cutaway stockpot turns from clear to milky as the clock sweeps (pinned ~200vh). */
export function Broth() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  // stable props: the scene rebuilds its materials when these change
  const shot = useMemo(brothShot, []);
  const hourRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState(pinned ? 0 : 2);
  const progress = useScrollProgress(ref, {
    enabled: pinned,
    onUpdate: (p) => {
      ref.current?.style.setProperty('--p', p.toFixed(4));
      setPhase(p < 0.4 ? 0 : p < 0.75 ? 1 : 2);
      if (hourRef.current && HOURS) hourRef.current.textContent = String(Math.round(Math.min(1, p / 0.9) * HOURS)).padStart(2, '0');
    },
  });

  return (
    <section id="broth" ref={ref} aria-labelledby="broth-title" className="relative bg-charcoal-950" style={{ height: pinned ? '220vh' : undefined }}>
      <div className={`${pinned ? 'sticky top-0' : 'relative'} h-screen-s overflow-hidden`}>
        <Stage<PhotoSceneProps> load={loadPhoto} progress={progress} sceneProps={shot} poster={<BrothPoster />} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgb(20_20_20/0.92),rgb(20_20_20/0.55)_38%,transparent_55%,rgb(20_20_20/0.85))] md:bg-[linear-gradient(90deg,rgb(20_20_20/0.85),transparent_45%)]" />
        <div className="container-x relative z-10 flex h-full flex-col justify-between pb-[calc(var(--bottom-bar-h)+20px)] pt-[calc(var(--header-h)+24px)] md:flex-row md:items-center md:pb-0 md:pt-0">
          <div className="max-w-md">
            <ChapterHeading n="02" label="The broth" jp="出汁" />
            <h2 id="broth-title" className="display mt-5 text-[clamp(2.2rem,5.5vw,4.6rem)]">
              Bones, water
              <br />
              and time.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-washi-50/80">Tonkotsu means pork bone. Simmered long and hard, the bones give up everything and the stock turns from clear to a rich, milky white.</p>
            <p className="mt-4 text-[13px] text-washi-50/55">
              <Ph value={site.story} />
            </p>
          </div>
          <div className="flex items-center gap-6 md:flex-col md:items-end">
            <SimmerClock hourRef={hourRef} />
            <ol className="flex gap-4 md:flex-col md:items-end md:gap-2" aria-label="Broth stages">
              {PHASES.map((ph, i) => (
                <li key={ph} aria-current={i === phase ? 'step' : undefined} className={`label transition-colors duration-500 ${i === phase ? 'text-vermilion-400' : i < phase ? 'text-washi-50/70' : 'text-washi-50/30'}`}>
                  {ph}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function SimmerClock({ hourRef }: { hourRef: RefObject<HTMLSpanElement> }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 120 120" className="h-24 w-24 md:h-32 md:w-32" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgb(250 248 243 / 0.15)" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="56" fill="none" stroke="#D7392B" strokeWidth="2.5" strokeDasharray="351.86" style={{ strokeDashoffset: 'calc(351.86 - var(--p, 1) * 351.86)', transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="60" y1="10" x2="60" y2={i % 3 ? 15 : 19} stroke="rgb(250 248 243 / 0.5)" strokeWidth="1.5" transform={`rotate(${i * 30} 60 60)`} />
        ))}
        <line x1="60" y1="60" x2="60" y2="22" stroke="#FAF8F3" strokeWidth="2.5" strokeLinecap="round" style={{ transform: 'rotate(calc(var(--p, 1) * 720deg))', transformOrigin: '60px 60px' }} />
        <circle cx="60" cy="60" r="3.5" fill="#D7392B" />
      </svg>
      <p className="text-center text-[12px] text-washi-50/70">
        {HOURS ? (
          <>
            <span ref={hourRef} className="font-display text-2xl text-washi-50">
              00
            </span>{' '}
            / {HOURS} hours
          </>
        ) : (
          <>
            Simmer time <Ph value={site.brothHours} /> hours
          </>
        )}
      </p>
    </div>
  );
}

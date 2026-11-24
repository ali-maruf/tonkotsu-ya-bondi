import { useMemo, useRef, useState } from 'react';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { ChapterHeading } from '../ui/ChapterHeading';
import { Stage } from '../ui/Stage';
import { SushiPoster } from './posters';
import { SCENES, pickSrc } from '../../lib/media';
import { tokens } from '../../lib/tokens';
import type { PhotoSceneProps } from '../three/PhotoScene';

const loadPhoto = () => import('../three/PhotoScene');

// the camera glides down the row of maki, from the nearest piece toward the bamboo mat
const sushiShot = (): PhotoSceneProps => ({
  image: pickSrc(SCENES.sushi),
  imageAspect: SCENES.sushi.aspect,
  depth: SCENES.sushi.depth,
  focus: 0.55,
  pointerParallax: 0.018,
  path: [
    { at: 0, zoom: 1.04, center: [0.5, 0.5], drift: [0, 0] },
    { at: 0.45, zoom: 1.2, center: [0.62, 0.6], drift: [-0.01, 0.006] },
    { at: 1, zoom: 1.32, center: [0.74, 0.38], drift: [0.012, -0.006] },
  ],
  noren: { color: tokens.charcoal950, ink: tokens.washi50, glyphs: ['寿司', '豚骨屋'], range: [0, 0.12] },
  vignette: 0.12,
  background: tokens.broth100,
});
const STEPS = [
  { at: 0.12, label: 'Rolled' },
  { at: 0.45, label: 'Sliced' },
  { at: 0.75, label: 'Served' },
];

/** Chapter 4 (cream): the makisu rolls closed, the roll is sliced and fanned onto slate (pinned ~220vh). */
export function Sushi() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  // stable props: the scene rebuilds its materials when these change
  const shot = useMemo(sushiShot, []);
  const [step, setStep] = useState(pinned ? -1 : 2);
  const progress = useScrollProgress(ref, {
    enabled: pinned,
    onUpdate: (p) => {
      let i = -1;
      STEPS.forEach((s, k) => p >= s.at && (i = k));
      setStep(i);
    },
  });

  return (
    <section id="sushi" ref={ref} aria-labelledby="sushi-title" className="relative bg-broth-100 text-charcoal-950" style={{ height: pinned ? '220vh' : undefined }}>
      <div className={`${pinned ? 'sticky top-0' : 'relative'} h-screen-s overflow-hidden`}>
        <Stage<PhotoSceneProps> load={loadPhoto} progress={progress} sceneProps={shot} poster={<SushiPoster />} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgb(243_234_219/0.95),rgb(243_234_219/0)_38%)]" />
        <div className="container-x relative z-10 flex h-full flex-col justify-between pb-[calc(var(--bottom-bar-h)+20px)] pt-[calc(var(--header-h)+24px)] md:flex-row md:pb-16">
          <div className="max-w-md">
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

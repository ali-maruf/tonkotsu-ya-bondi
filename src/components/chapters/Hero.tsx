import { useMemo, useRef } from 'react';
import { SCENES, pickSrc } from '../../lib/media';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { tokens } from '../../lib/tokens';
import { CssNoren } from '../ui/CssNoren';
import { OrderLink } from '../ui/OrderLink';
import { PhotoPoster } from '../ui/PhotoPoster';
import { Stage } from '../ui/Stage';
import type { PhotoSceneProps } from '../three/PhotoScene';

const loadPhoto = () => import('../three/PhotoScene');

const isPortrait = () => window.innerWidth / window.innerHeight < 0.8;

function heroShot(portrait: boolean): Omit<PhotoSceneProps, 'background'> {
  if (portrait) {
    const s = SCENES.heroPortrait;
    return {
      image: pickSrc(s),
      imageAspect: s.aspect,
      path: [
        { at: 0, zoom: 1.0, center: [0.5, 0.5] },
        { at: 0.55, zoom: 1.14, center: [0.5, 0.62] },
        { at: 1, zoom: 1.16, center: [0.5, 0.64] },
      ],
      steam: { rect: [0.25, 0.56, 0.75, 0.66], count: 900, rise: 0.4 },
      wordmark: { text: 'TONKOTSU YA', center: [0.5, 0.42], width: 0.52, range: [0.82, 1] },
      noren: { color: tokens.vermilion600, ink: tokens.washi50, glyphs: ['豚骨', 'ラーメン'], range: [0, 0.14] },
      vignette: 0.3,
    };
  }
  const s = SCENES.hero;
  return {
    image: pickSrc(s),
    imageAspect: s.aspect,
    depth: s.depth,
    focus: 0.55,
    pointerParallax: 0.022,
    path: [
      { at: 0, zoom: 1.04, center: [0.5, 0.5], drift: [0, 0] },
      { at: 0.5, zoom: 1.1, center: [0.58, 0.5], drift: [0.012, 0.004] },
      { at: 1, zoom: 1.16, center: [0.64, 0.47], drift: [-0.014, 0.008] },
    ],
    steam: { rect: [0.5, 0.3, 0.88, 0.46], count: 1500, rise: 0.42 },
    wordmark: { text: 'TONKOTSU YA', center: [0.7, 0.2], width: 0.25, range: [0.8, 1] },
    noren: { color: tokens.vermilion600, ink: tokens.washi50, glyphs: ['豚骨', 'ラーメン'], range: [0, 0.14] },
    vignette: 0.35,
  };
}

/**
 * Chapter 1 (pinned ~260vh): the noren parts onto a real bowl. Scrolling dollies the camera in with
 * depth parallax while steam rises and finally gathers into the wordmark above the bowl.
 */
export function Hero() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  const shot = useMemo(() => heroShot(isPortrait()), []);
  const progress = useScrollProgress(ref, {
    enabled: pinned,
    onUpdate: (p) => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--o', Math.min(1, p / 0.14).toFixed(4));
    },
  });

  return (
    <section id="top" ref={ref} aria-label="Tonkotsu Ya, Bondi Junction" className="relative bg-charcoal-950" style={{ height: pinned ? '260vh' : undefined }}>
      <div className="sticky top-0 h-screen-s overflow-hidden">
        <Stage<PhotoSceneProps>
          load={loadPhoto}
          progress={progress}
          idle
          sceneProps={{ ...shot, background: tokens.charcoal950 }}
          poster={<PhotoPoster scene={SCENES.hero} portrait={SCENES.heroPortrait} position="65% 50%" priority />}
          curtain={(ready) => <CssNoren glyphs={['豚骨', 'ラーメン']} hidden={ready} />}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgb(20_20_20/0.7),transparent_32%,transparent_60%,rgb(20_20_20/0.85))] md:bg-[linear-gradient(90deg,rgb(20_20_20/0.85),rgb(20_20_20/0.3)_42%,transparent_60%),linear-gradient(0deg,rgb(20_20_20/0.6),transparent_30%)]" />

        <div className="container-x relative z-10 flex h-full flex-col justify-between pb-[calc(var(--bottom-bar-h)+20px)] pt-[calc(var(--header-h)+28px)] md:justify-end md:pb-16">
          <div className="hero-copy max-w-[44rem]">
            <p className="label text-vermilion-400">Eastgate · Bondi Junction</p>
            <h1 className="display mt-4 text-[clamp(2.6rem,5.4vw,5rem)]">
              Rich tonkotsu.
              <br />
              Right in Bondi Junction.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-washi-50/80 md:text-base">Ramen, sushi and Japanese meals inside Eastgate Shopping Centre. Dine in, take away, or order delivery.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <OrderLink location="hero">Order on Uber Eats</OrderLink>
            <a href="#menu" className="btn-ghost" data-cta="see_menu" data-cta-location="hero">
              See the Menu
            </a>
          </div>
        </div>

        {pinned && (
          <div aria-hidden="true" className="absolute bottom-6 right-[var(--gutter)] z-10 hidden flex-col items-center gap-2 text-washi-50/60 lg:flex" style={{ opacity: 'calc(1 - var(--p, 0) * 12)' }}>
            <span className="label">Scroll</span>
            <span className="h-10 w-px animate-pulse bg-gradient-to-b from-washi-50/70 to-transparent" />
          </div>
        )}
      </div>
      <style>{`@media (max-width: 767px){ #top .hero-copy{ opacity: calc(1 - max(0, var(--p, 0) - 0.8) * 7); } }`}</style>
    </section>
  );
}

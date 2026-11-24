import { useRef } from 'react';
import { HERO_FRAMES, SCENES } from '../../lib/media';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { CssNoren } from '../ui/CssNoren';
import { FilmStage } from '../ui/FilmStage';
import { OrderLink } from '../ui/OrderLink';
import { PhotoPoster } from '../ui/PhotoPoster';

/**
 * Chapter 1 (pinned ~280vh): the noren swings open in 3D onto a real bowl, then scrolling drives a
 * Higgsfield camera orbit around it (video frames scrubbed forwards and backwards). The headline tips
 * back into depth as the camera moves in, and the wordmark flies forward out of the steam at the end.
 */
export function Hero() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  const film = useRef({ value: 0 });
  useScrollProgress(ref, {
    enabled: pinned,
    onUpdate: (p) => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--o', Math.min(1, p / 0.14).toFixed(4));
      film.current.value = Math.min(1, Math.max(0, (p - 0.06) / 0.9));
    },
  });

  return (
    <section id="top" ref={ref} aria-label="Tonkotsu Ya, Bondi Junction" className="relative bg-charcoal-950" style={{ height: pinned ? '280vh' : undefined }}>
      <div className="sticky top-0 h-screen-s overflow-hidden" style={{ perspective: '1000px' }}>
        <FilmStage frames={HERO_FRAMES} progress={film.current} enabled={pinned} focusX={0.62} poster={<PhotoPoster scene={SCENES.hero} portrait={SCENES.heroPortrait} position="65% 50%" priority />} />
        {pinned && <CssNoren glyphs={['豚骨', 'ラーメン']} />}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgb(20_20_20/0.7),transparent_32%,transparent_60%,rgb(20_20_20/0.85))] md:bg-[linear-gradient(90deg,rgb(20_20_20/0.85),rgb(20_20_20/0.3)_42%,transparent_60%),linear-gradient(0deg,rgb(20_20_20/0.6),transparent_30%)]" />

        {pinned && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+6vh)] z-[4] flex justify-center md:top-[12vh] md:justify-end md:pr-[8vw]" style={{ perspective: '900px' }}>
            <p
              className="font-display text-[clamp(2.6rem,9vw,8rem)] font-extrabold leading-none tracking-tight text-washi-50 [text-shadow:0_20px_60px_rgb(0_0_0/0.6)]"
              style={{
                opacity: 'clamp(0, (var(--p, 0) - 0.72) * 5, 1)',
                transform: 'translateZ(calc((1 - clamp(0, (var(--p, 0) - 0.72) * 3.6, 1)) * -900px)) rotateX(calc((1 - clamp(0, (var(--p, 0) - 0.72) * 3.6, 1)) * 40deg))',
              }}
            >
              TONKOTSU YA
            </p>
          </div>
        )}

        <div className="container-x relative z-10 flex h-full flex-col justify-between pb-[calc(var(--bottom-bar-h)+20px)] pt-[calc(var(--header-h)+28px)] md:justify-end md:pb-16">
          <div
            className="hero-copy max-w-[44rem]"
            style={pinned ? { transformOrigin: '0% 100%', transform: 'translateZ(calc(var(--p, 0) * -260px)) rotateY(calc(var(--p, 0) * 14deg)) rotateX(calc(var(--p, 0) * 10deg))', opacity: 'calc(1 - max(0, var(--p, 0) - 0.55) * 3)' } : undefined}
          >
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
    </section>
  );
}

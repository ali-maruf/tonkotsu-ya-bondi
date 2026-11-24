import { useRef, useState } from 'react';
import { NOODLE_FRAMES } from '../../lib/media';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { ChapterHeading } from '../ui/ChapterHeading';
import { CssNoren } from '../ui/CssNoren';
import { FrameScrub } from '../ui/FrameScrub';
import { OrderLink } from '../ui/OrderLink';
import { NoodlePoster } from './posters';

/**
 * Chapter 3 (pinned ~200vh): a real slow-motion noodle lift (Higgsfield video, Seedance 2.5) scrubbed
 * frame by frame with scroll, so the lift runs forwards and backwards with the reader.
 */
export function NoodlePull() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const scrub = useRef({ value: 0 });
  useScrollProgress(ref, {
    enabled: pinned,
    onUpdate: (p) => {
      ref.current?.style.setProperty('--p', p.toFixed(4));
      ref.current?.style.setProperty('--o', Math.min(1, p / 0.14).toFixed(4));
      // the lift plays across the pinned stretch after the curtain opens
      scrub.current.value = Math.min(1, Math.max(0, (p - 0.1) / 0.85));
    },
  });

  return (
    <section id="noodles" ref={ref} aria-labelledby="noodles-title" className="relative bg-charcoal-950" style={{ height: pinned ? '200vh' : undefined }}>
      <div className={`${pinned ? 'sticky top-0' : 'relative'} h-screen-s overflow-hidden`}>
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready && pinned ? 'opacity-0' : 'opacity-100'}`}>
          <NoodlePoster />
        </div>
        {pinned && <FrameScrub dir={NOODLE_FRAMES.dir} count={NOODLE_FRAMES.count} aspect={NOODLE_FRAMES.aspect} progress={scrub.current} focusX={0.58} onReady={() => setReady(true)} />}
        {pinned && <CssNoren glyphs={['麺', 'ラーメン']} />}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(0deg,rgb(20_20_20/0.9),transparent_45%)]" />
        <div className="container-x relative z-10 flex h-full flex-col justify-end pb-[calc(var(--bottom-bar-h)+20px)] md:pb-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end" style={{ opacity: pinned ? 'calc(var(--p, 0) * 3 - 0.45)' : 1 }}>
            <div className="max-w-lg">
              <ChapterHeading n="03" label="The noodles" jp="麺" />
              <h2 id="noodles-title" className="display mt-5 text-[clamp(2.2rem,5.5vw,4.6rem)]">The lift.</h2>
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-washi-50/80">Pulled up slow from the bowl, every strand carries the broth with it.</p>
            </div>
            <OrderLink location="noodles" className="btn-ghost self-start md:self-auto">
              Order a bowl
            </OrderLink>
          </div>
        </div>
      </div>
    </section>
  );
}

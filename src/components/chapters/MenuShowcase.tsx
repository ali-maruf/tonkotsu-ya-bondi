import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { featured } from '../../lib/menu';
import { useMotion } from '../../lib/motion';
import { ScrollTrigger, useScrollProgress } from '../../lib/scroll';
import { DishPhoto } from '../ui/DishPhoto';
import { ROUND_DISHES } from '../../lib/media';
import { BowlCard } from '../ui/BowlCard';
import { OrderLink } from '../ui/OrderLink';
import { Ph } from '../ui/Ph';

/** Chapter 5: pinned horizontal gallery of featured dishes from menu.json, bowls turning as you scroll. */
export function MenuShowcase() {
  const { tier } = useMotion();
  const pinned = tier !== 'static';
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    if (!pinned) return;
    const measure = () => track.current && setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current!);
    return () => ro.disconnect();
  }, [pinned]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [distance]);

  useScrollProgress(ref, {
    enabled: pinned,
    scrub: 0.5,
    onUpdate: (p) => {
      ref.current?.style.setProperty('--p', p.toFixed(4));
      if (track.current) track.current.style.transform = `translate3d(${-p * distance}px,0,0)`;
    },
  });

  return (
    <section id="showcase" ref={ref} aria-labelledby="showcase-title" className="relative bg-charcoal-950" style={{ height: pinned ? `calc(100vh + ${distance}px)` : undefined }}>
      <div className={`${pinned ? 'sticky top-0 h-screen-s' : 'relative py-24'} flex flex-col justify-center overflow-hidden`}>
        <div className="container-x mb-8 flex items-end justify-between gap-6 md:mb-12">
          <h2 id="showcase-title" className="display text-[clamp(2rem,4.5vw,3.6rem)]">
            From the counter
          </h2>
          <a href="#menu" className="hidden text-[13px] font-medium text-washi-50/70 underline decoration-vermilion-600 underline-offset-4 hover:text-washi-50 md:inline" data-cta="see_menu" data-cta-location="showcase">
            Full menu
          </a>
        </div>
        <ul ref={track} className={`flex gap-5 px-[var(--gutter)] will-change-transform md:gap-8 ${pinned ? '' : 'snap-x snap-mandatory overflow-x-auto pb-4'}`}>
          <BowlCard />
          {featured.map((item, i) => (
            <li key={item.id} className="group relative flex w-[78vw] max-w-[440px] shrink-0 snap-center flex-col rounded-[28px] border border-washi-50/10 bg-charcoal-800/60 p-6 md:w-[34vw] md:p-8">
              <div className="relative mx-auto aspect-square w-[82%]">
                <div className="absolute inset-[8%] rounded-full bg-black/50 blur-2xl" aria-hidden="true" />
                <DishPhoto
                  visual={item.visual}
                  alt={`${item.category.label} dish (illustrative photo)`}
                  sizes="(min-width: 768px) 30vw, 70vw"
                  className="relative h-full w-full shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]"
                  style={{ transform: ROUND_DISHES.has(item.visual) ? `rotate(calc(var(--p, 0) * 120deg + ${i * 37}deg))` : `rotate(calc(var(--p, 0) * 14deg - 7deg))` }}
                />
              </div>
              <div className="mt-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="label text-vermilion-400">{item.category.label}</p>
                  <h3 className="mt-2 font-display text-xl font-extrabold leading-tight">
                    <Ph value={item.name} />
                  </h3>
                </div>
                <p className="shrink-0 font-display text-lg font-extrabold text-washi-50/90">
                  <Ph value={item.price} />
                </p>
              </div>
              <OrderLink location="showcase" item={item.id} className="btn-primary mt-6 w-full">
                Order
              </OrderLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

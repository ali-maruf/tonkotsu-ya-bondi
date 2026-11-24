import { gsap, ScrollTrigger } from './scroll';

/**
 * One-shot 3D reveals for every `[data-reveal]` element, played once as it scrolls into view
 * (cheaper than scrubbing every element on every scroll frame):
 *  - "rise" (default): tips up out of the page (rotateX)
 *  - "card": swings in from the side like a card being dealt (rotateY), staggered by `data-reveal-i`
 *  - "deep": comes forward from depth (headings)
 */
export function initReveals() {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  const ctx = gsap.context(() => {
    els.forEach((el) => {
      const kind = el.dataset.reveal || 'rise';
      const i = Number(el.dataset.revealI || 0);
      const from =
        kind === 'card'
          ? { rotateY: i % 2 ? -24 : 24, z: -200, y: 60, opacity: 0 }
          : kind === 'deep'
            ? { z: -300, rotateX: 18, y: 30, opacity: 0 }
            : { rotateX: 30, y: 50, opacity: 0 };
      gsap.fromTo(
        el,
        { ...from, transformPerspective: 1100, transformOrigin: kind === 'card' ? '50% 100%' : '50% 0%' },
        {
          rotateX: 0,
          rotateY: 0,
          z: 0,
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: Math.min(i, 5) * 0.08,
          ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    });
  });
  // late layout (fonts, images) shifts trigger positions
  const t = setTimeout(() => ScrollTrigger.refresh(), 1200);
  return () => {
    clearTimeout(t);
    ctx.revert();
  };
}

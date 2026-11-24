import { gsap, ScrollTrigger } from './scroll';

/**
 * Scroll-scrubbed 3D reveals for every `[data-reveal]` element:
 *  - "rise" (default): tips up out of the page (rotateX) and comes forward in Z
 *  - "card": swings in from the side like a card being dealt (rotateY + Z), staggered by `data-reveal-i`
 *  - "deep": flies in from far back in Z (headings)
 * Scrubbed, so scrolling back reverses them.
 */
export function initReveals() {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  const ctx = gsap.context(() => {
    els.forEach((el) => {
      const kind = el.dataset.reveal || 'rise';
      const i = Number(el.dataset.revealI || 0);
      const from =
        kind === 'card'
          ? { rotateY: i % 2 ? -38 : 38, rotateX: 18, z: -380, y: 120, opacity: 0 }
          : kind === 'deep'
            ? { z: -700, rotateX: 28, y: 60, opacity: 0 }
            : { rotateX: 55, z: -220, y: 90, opacity: 0 };
      gsap.fromTo(
        el,
        { ...from, transformPerspective: 1100, transformOrigin: kind === 'card' ? '50% 100%' : '50% 0%' },
        {
          rotateX: 0,
          rotateY: 0,
          z: 0,
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: `top ${98 - Math.min(i, 5) * 3}%`, end: `top ${62 - Math.min(i, 5) * 3}%`, scrub: 0.6 },
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

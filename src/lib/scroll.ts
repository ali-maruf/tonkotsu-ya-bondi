import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

let lenis: Lenis | null = null;

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger and Lenis share one clock. */
export function initSmoothScroll() {
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToHash(hash: string) {
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -56 });
  else el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  history.replaceState(null, '', hash);
}

export type Progress = { value: number };

/**
 * Scroll-scrubbed progress (0..1) for a section. Returned as a stable mutable object so WebGL scenes can read it
 * every frame without re-rendering React. Scrubbing makes every chapter fully reversible.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  { start = 'top top', end = 'bottom bottom', scrub = 0.7, enabled = true, onUpdate }: { start?: string; end?: string; scrub?: number | boolean; enabled?: boolean; onUpdate?: (p: number) => void } = {},
) {
  const progress = useRef<Progress>({ value: enabled ? 0 : 1 });
  const cb = useRef(onUpdate);
  cb.current = onUpdate;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      progress.current.value = 1;
      cb.current?.(1);
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        progress.current,
        { value: 0 },
        { value: 1, ease: 'none', onUpdate: () => cb.current?.(progress.current.value), scrollTrigger: { trigger: el, start, end, scrub } },
      );
    }, el);
    return () => ctx.revert();
  }, [ref, start, end, scrub, enabled]);

  return progress.current;
}


import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Rendering tiers:
 *  - high:   full WebGL, live shaders, steam particles
 *  - low:    WebGL with baked textures, fewer particles, DPR 1 (modest phones, Save-Data off)
 *  - static: no scroll-scrubbing, plain photos. Only when asked for with ?lite=1 or ?tier=static.
 *
 * Reduced motion, Save-Data and missing WebGL no longer switch the scroll animations off: they are
 * scroll-driven (nothing plays on its own) and the films are plain 2D canvas. They drop to `low`, and
 * `webgl: false` only swaps the WebGL pieces (3D bowl, shader noren) for their CSS/photo fallbacks.
 */
export type Tier = 'high' | 'low' | 'static';
type MotionState = { tier: Tier; reducedMotion: boolean; webgl: boolean };

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function detectMotion(): MotionState {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const forced = params.get('tier') as Tier | null;
  const webgl = hasWebGL();
  if (forced === 'high' || forced === 'low' || forced === 'static') return { tier: forced, reducedMotion, webgl };
  if (params.get('lite') === '1') return { tier: 'static', reducedMotion, webgl };
  if (reducedMotion || nav.connection?.saveData || !webgl) return { tier: 'low', reducedMotion, webgl };
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const low = cores <= 4 || mem <= 4 || (coarse && window.innerWidth < 768 && cores <= 6);
  return { tier: low ? 'low' : 'high', reducedMotion, webgl };
}

const MotionContext = createContext<MotionState>({ tier: 'static', reducedMotion: true, webgl: false });

export function MotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MotionState>(detectMotion);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setState(detectMotion());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return <MotionContext.Provider value={state}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);

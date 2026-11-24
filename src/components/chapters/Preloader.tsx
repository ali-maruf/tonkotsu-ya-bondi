import { useEffect, useState } from 'react';
import { useMotion } from '../../lib/motion';
import { Hanko } from '../ui/Brand';

const KEY = 'ty-stamped';

/** Chapter 0: a hanko presses the bowl mark onto washi. Once per session; skipped for reduced motion. */
export function Preloader() {
  const { reducedMotion } = useMotion();
  const [phase, setPhase] = useState<'stamp' | 'leave' | 'done'>(() => {
    try {
      return reducedMotion || sessionStorage.getItem(KEY) ? 'done' : 'stamp';
    } catch {
      return reducedMotion ? 'done' : 'stamp';
    }
  });

  useEffect(() => {
    if (phase === 'done') return;
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* storage unavailable: show every time */
    }
    const leave = setTimeout(() => setPhase('leave'), 1350);
    const done = setTimeout(() => setPhase('done'), 2000);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      className="washi-texture fixed inset-0 z-[100] flex items-center justify-center transition-[clip-path,opacity] duration-[650ms]"
      style={{ clipPath: phase === 'leave' ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)', transitionTimingFunction: 'cubic-bezier(0.76,0,0.24,1)', pointerEvents: phase === 'leave' ? 'none' : 'auto' }}
    >
      <style>{`
        @keyframes hanko-press {
          0% { transform: translateY(-46px) scale(1.5); opacity: 0; filter: drop-shadow(0 30px 24px rgb(0 0 0 / .25)); }
          45% { opacity: 1; }
          62% { transform: translateY(0) scale(0.94); filter: drop-shadow(0 2px 2px rgb(0 0 0 / .2)); }
          74% { transform: scale(1.02); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0 rgb(0 0 0 / 0)); }
        }
        @keyframes hanko-ink { 0%, 58% { opacity: 0; } 70% { opacity: 1; } }
      `}</style>
      <div className="flex flex-col items-center">
        <div className="relative h-28 w-28" style={{ animation: 'hanko-press 1.1s cubic-bezier(0.22,1,0.36,1) both' }}>
          <Hanko className="h-full w-full" />
        </div>
        <p className="label mt-6 text-charcoal-950/70" style={{ animation: 'hanko-ink 1.1s ease both' }}>
          Tonkotsu Ya · Bondi Junction
        </p>
      </div>
    </div>
  );
}

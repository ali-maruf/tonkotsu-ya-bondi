import { useState } from 'react';
import { useMotion } from '../../lib/motion';
import { Stage } from './Stage';

const loadBowl = () => import('../three/BowlModel');
const still = { value: 0 };

/** First card of the showcase: the bowl as a real 3D model the visitor can turn. */
export function BowlCard() {
  const { tier } = useMotion();
  const [ready, setReady] = useState(false);
  return (
    <li className="relative flex w-[78vw] max-w-[440px] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-washi-50/10 bg-[radial-gradient(ellipse_at_50%_35%,#2c2622,#181818_70%)] p-6 md:w-[34vw] md:p-8">
      <div className="relative mx-auto aspect-square w-full">
        {tier === 'static' ? (
          <img src="/media/menu-ramen-cream-800.webp" alt="Tonkotsu ramen bowl (illustrative photo)" className="h-full w-full rounded-full object-cover" loading="lazy" />
        ) : (
          <Stage load={loadBowl} progress={still} onReady={() => setReady(true)} />
        )}
        {tier !== 'static' && !ready && <div className="absolute inset-0 grid place-items-center text-[12px] text-washi-50/50">Loading 3D bowl…</div>}
      </div>
      <p className="label mt-6 text-vermilion-400">In 3D</p>
      <h3 className="mt-2 font-display text-xl font-extrabold leading-tight">Turn the bowl.</h3>
      <p className="mt-2 text-[13px] text-washi-50/60">{tier === 'static' ? 'Tonkotsu ramen, from every side.' : 'Drag to look at it from every side.'}</p>
    </li>
  );
}

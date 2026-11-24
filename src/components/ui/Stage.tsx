import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { useMotion } from '../../lib/motion';
import { useInView, usePageVisible } from '../../lib/useInView';
import type { Progress } from '../../lib/scroll';

type SceneComponent<P> = ComponentType<P & { progress: Progress; active: boolean; tier: 'high' | 'low'; onReady?: () => void }>;

const whenIdle = () =>
  new Promise<void>((resolve) => {
    const go = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 1200 }) : setTimeout(resolve, 300));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  });

/**
 * Lazy WebGL stage. The scene's code is only fetched when the stage nears the viewport, the canvas is
 * unmounted when it is far away, and its render loop pauses when off-screen or the tab is hidden.
 * The poster renders underneath and stays as the fallback for the static tier.
 */
export function Stage<P extends object>({
  load,
  progress,
  poster,
  curtain,
  idle = false,
  sceneProps,
  onReady,
}: {
  load: () => Promise<{ default: SceneComponent<P> }>;
  progress: Progress;
  poster?: ReactNode;
  /** shown on top until the canvas has painted (e.g. the CSS noren) */
  curtain?: (ready: boolean) => ReactNode;
  /** wait for page load + idle before fetching (protects LCP for the hero) */
  idle?: boolean;
  sceneProps?: P;
  onReady?: () => void;
}) {
  const { tier, webgl: hasGL } = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, '120% 0px');
  const onScreen = useInView(ref, '0px');
  const pageVisible = usePageVisible();
  const [Scene, setScene] = useState<SceneComponent<P> | null>(null);
  const [ready, setReady] = useState(false);
  const webgl = tier !== 'static' && hasGL;

  useEffect(() => {
    if (!webgl || !near || Scene) return;
    let cancelled = false;
    (idle ? whenIdle() : Promise.resolve())
      .then(load)
      .then((m) => !cancelled && setScene(() => m.default))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [webgl, near, Scene, idle, load]);

  useEffect(() => {
    if (!near) setReady(false);
  }, [near]);

  const mounted = webgl && near && Scene;

  return (
    <div ref={ref} className="absolute inset-0">
      {poster && <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}>{poster}</div>}
      {mounted && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          <Scene
            {...(sceneProps as P)}
            progress={progress}
            active={onScreen && pageVisible}
            tier={tier as 'high' | 'low'}
            onReady={() => {
              setReady(true);
              onReady?.();
            }}
          />
        </div>
      )}
      {tier !== 'static' && curtain?.(webgl && ready)}
    </div>
  );
}

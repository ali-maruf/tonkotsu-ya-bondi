import { useEffect, useRef } from 'react';
import { useInView } from '../../lib/useInView';
import type { Progress } from '../../lib/scroll';

/**
 * Scroll-scrubbed image sequence (Apple-style): video frames drawn to a canvas, cover-fit, by progress.
 * Frames load only when the section nears the viewport: a coarse pass first (every 4th frame), then the
 * gaps, and the nearest loaded frame is drawn meanwhile, so scrubbing works before everything arrives.
 */
export function FrameScrub({ dir, count, aspect, progress, focusX = 0.5, onReady }: { dir: string; count: number; aspect: number; progress: Progress; focusX?: number; onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const near = useInView(wrap, '150% 0px', true);
  // the draw loop only runs while the canvas is actually on screen
  const onScreen = useInView(wrap, '0px');
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  // kept in a ref so a new callback identity doesn't restart loading
  const readyCb = useRef(onReady);
  readyCb.current = onReady;

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    let readySent = false;
    frames.current = new Array(count).fill(null);
    const order = [...Array.from({ length: Math.ceil(count / 4) }, (_, i) => i * 4).filter((i) => i < count), ...Array.from({ length: count }, (_, i) => i).filter((i) => i % 4)];
    let next = 0;
    const loadNext = () => {
      if (cancelled || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = 'async';
      img.src = `${dir}/${String(i).padStart(3, '0')}.webp`;
      img.onload = () => {
        if (cancelled) return;
        frames.current[i] = img;
        if (!readySent && i === 0) {
          readySent = true;
          readyCb.current?.();
        }
        loadNext();
      };
      img.onerror = loadNext;
    };
    for (let k = 0; k < 4; k++) loadNext();
    return () => {
      cancelled = true;
    };
  }, [near, dir, count]);

  useEffect(() => {
    if (!near || !onScreen) return;
    let raf = 0;
    let drawn = -1;
    let w = 0, h = 0;
    const c = canvas.current!;
    // size from a ResizeObserver instead of reading layout every frame; frames are 1280px wide,
    // so the canvas is drawn at 1x (higher DPR only costs fill rate)
    const ro = new ResizeObserver(([e]) => {
      c.width = w = Math.round(e.contentRect.width);
      c.height = h = Math.round(e.contentRect.height);
      drawn = -1;
    });
    ro.observe(c);
    const ctx = c.getContext('2d', { alpha: false })!;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!w || !h) return;
      const target = Math.round(Math.min(1, Math.max(0, progress.value)) * (count - 1));
      let i = target;
      for (let d = 0; d < count && !frames.current[i]; d++) i = frames.current[target - d] ? target - d : frames.current[target + d] ? target + d : i;
      const img = frames.current[i];
      if (!img || i === drawn) return;
      drawn = i;
      const A = w / h;
      let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      if (A > aspect) {
        sh = sw / A;
        sy = (img.naturalHeight - sh) / 2;
      } else {
        sw = sh * A;
        sx = (img.naturalWidth - sw) * focusX;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [near, onScreen, count, aspect, focusX, progress]);

  return (
    <div ref={wrap} className="absolute inset-0">
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}

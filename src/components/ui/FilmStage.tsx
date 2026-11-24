import { useState, type ReactNode } from 'react';
import type { Frames } from '../../lib/media';
import type { Progress } from '../../lib/scroll';
import { FrameScrub } from './FrameScrub';

/**
 * A pinned chapter's backdrop: a real camera-move film (video frames) scrubbed by scroll, over the
 * matching still. The still is first paint and the static-tier view; the film fades in once its first
 * frame has loaded. A gentle scroll-linked push-in (scale, reading --p) adds depth on top.
 */
export function FilmStage({ frames, progress, poster, enabled, focusX = 0.5 }: { frames: Frames; progress: Progress; poster: ReactNode; enabled: boolean; focusX?: number }) {
  const [ready, setReady] = useState(false);
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={enabled ? { transform: 'scale(calc(1.02 + var(--p, 0) * 0.06))', transformOrigin: '50% 60%' } : undefined}
      >
        <div className={`absolute inset-0 transition-opacity duration-700 ${ready && enabled ? 'opacity-0' : 'opacity-100'}`}>{poster}</div>
        {enabled && frames.count > 0 && <FrameScrub dir={frames.dir} count={frames.count} aspect={frames.aspect} progress={progress} focusX={focusX} onReady={() => setReady(true)} />}
      </div>
    </div>
  );
}

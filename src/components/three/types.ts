import type { Progress } from '../../lib/scroll';

export type SceneTier = 'high' | 'low';
export type SceneProps = {
  progress: Progress;
  /** false pauses the render loop (off-screen or tab hidden) */
  active: boolean;
  tier: SceneTier;
  onReady?: () => void;
};

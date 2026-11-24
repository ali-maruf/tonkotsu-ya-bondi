import { NorenCanvas } from './parts';
import type { SceneProps } from './types';

export type NorenOpenerProps = { color: string; ink: string; glyphs: [string, string] };

export default function NorenOpenerScene({ progress, active, onReady, color, ink, glyphs }: SceneProps & NorenOpenerProps) {
  return <NorenCanvas progress={progress} active={active} onReady={onReady} color={color} ink={ink} glyphs={glyphs} />;
}

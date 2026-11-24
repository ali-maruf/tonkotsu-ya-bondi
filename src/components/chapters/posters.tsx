import { SCENES } from '../../lib/media';
import { PhotoPoster } from '../ui/PhotoPoster';

/** Photographic stand-ins: shown while each WebGL stage loads, and as the static (reduced motion / low power) view. */
export const BrothPoster = () => <PhotoPoster scene={SCENES.broth} position="70% 50%" />;
export const NoodlePoster = () => <PhotoPoster scene={SCENES.noodle} position="58% 50%" />;
export const SushiPoster = () => <PhotoPoster scene={SCENES.sushi} position="68% 50%" />;

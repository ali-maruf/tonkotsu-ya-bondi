/**
 * Photographic assets generated with Higgsfield (GPT Image 2.6, Seedance 2.5, Meshy image-to-3D).
 * They are illustrative AI imagery, not photographs of Tonkotsu Ya's own dishes; swap in real
 * photography with the same filenames when it exists.
 */
export type Scene = {
  /** path prefix; files are `${base}-${width}.webp` */
  base: string;
  widths: number[];
  /** width / height */
  aspect: number;
  alt: string;
};

export const SCENES: Record<'hero' | 'heroPortrait' | 'broth' | 'noodle' | 'sushi', Scene> = {
  hero: { base: '/media/hero', widths: [1280, 1920], aspect: 2688 / 1520, alt: 'A bowl of tonkotsu ramen with chashu, ajitama egg, nori and spring onion on a dark wood counter' },
  heroPortrait: { base: '/media/hero-portrait', widths: [720, 1080], aspect: 1520 / 2688, alt: 'A bowl of tonkotsu ramen with chashu, ajitama egg, nori and spring onion on a dark wood counter' },
  broth: { base: '/media/broth', widths: [1280, 1920], aspect: 2688 / 1520, alt: 'A steel stockpot of milky pork-bone broth simmering over a gas flame' },
  noodle: { base: '/media/noodle', widths: [1280, 1920], aspect: 2688 / 1520, alt: 'Chopsticks lifting noodles from milky tonkotsu broth, broth dripping' },
  sushi: { base: '/media/sushi', widths: [1280, 1920], aspect: 2688 / 1520, alt: 'Salmon and cucumber maki fanned on a slate board beside a bamboo mat' },
};

export const srcSet = (s: Scene) => s.widths.map((w) => `${s.base}-${w}.webp ${w}w`).join(', ');

/** Smallest rendition that covers the viewport at the device pixel ratio. */
export function pickSrc(s: Scene, cssWidth = window.innerWidth, cssHeight = window.innerHeight) {
  const coverWidth = Math.max(cssWidth, cssHeight * s.aspect) * Math.min(window.devicePixelRatio || 1, 2);
  const w = s.widths.find((x) => x >= coverWidth) ?? s.widths[s.widths.length - 1];
  return `${s.base}-${w}.webp`;
}

/** Top-down menu photography, keyed by menu.json `visual`. */
export const DISH_PHOTOS: Record<string, string> = {
  'ramen-cream': '/media/menu-ramen-cream',
  'ramen-amber': '/media/menu-ramen-amber',
  'ramen-red': '/media/menu-ramen-red',
  'sushi-maki': '/media/menu-sushi-maki',
  'sushi-nigiri': '/media/menu-sushi-nigiri',
  donburi: '/media/menu-donburi',
  'small-plate': '/media/menu-small-plate',
  cup: '/media/menu-cup',
};

/** Round dishes can spin in the showcase; boards and plates only tilt. */
export const ROUND_DISHES = new Set(['ramen-cream', 'ramen-amber', 'ramen-red', 'donburi', 'cup']);

export type Frames = { dir: string; count: number; width: number; aspect: number };
/** Higgsfield (Seedance 2.5) camera-move videos, extracted to WebP frames and scrubbed by scroll. */
export const HERO_FRAMES: Frames = { dir: '/media/hero-frames', count: 46, width: 1280, aspect: 16 / 9 };
export const BROTH_FRAMES: Frames = { dir: '/media/broth-frames', count: 46, width: 1280, aspect: 16 / 9 };
export const SUSHI_FRAMES: Frames = { dir: '/media/sushi-frames', count: 46, width: 1280, aspect: 16 / 9 };
export const NOODLE_FRAMES: Frames = { dir: '/media/noodle-frames', count: 41, width: 1280, aspect: 16 / 9 };
export const BOWL_MODEL = '/media/ramen-bowl.glb';

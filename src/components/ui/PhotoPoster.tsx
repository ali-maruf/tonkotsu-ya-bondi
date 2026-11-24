import { srcSet, type Scene } from '../../lib/media';

/** The scene photograph as a plain responsive image: first paint, LCP, and the static-tier fallback. */
export function PhotoPoster({ scene, position = 'center', priority = false, portrait }: { scene: Scene; position?: string; priority?: boolean; portrait?: Scene }) {
  const largest = `${scene.base}-${scene.widths[scene.widths.length - 1]}.webp`;
  return (
    <picture>
      {portrait && <source media="(max-aspect-ratio: 4/5)" srcSet={srcSet(portrait)} sizes="100vw" />}
      <img
        src={largest}
        srcSet={srcSet(scene)}
        sizes="100vw"
        alt={scene.alt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
        // React 18 only passes the lowercase attribute through
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}

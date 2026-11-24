/**
 * Analytics stub. Every conversion element carries data-cta="<name>" (plus optional
 * data-cta-* attributes). A single delegated listener reports clicks through track().
 * Swap the body of track() for GA4 / Meta / Plausible once the owner picks a provider.
 */
type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: string, props: Props = {}) {
  const payload = { event, ...props, ts: Date.now() };
  (window.dataLayer ??= []).push(payload);
  if (import.meta.env.DEV) console.debug('[analytics]', payload);
}

export function initCtaTracking() {
  const onClick = (e: MouseEvent) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-cta]');
    if (!el) return;
    const props: Props = { href: el.getAttribute('href') ?? undefined };
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('cta') && k !== 'cta') props[k.slice(3).replace(/^./, (c) => c.toLowerCase())] = v;
    }
    track(`cta_${el.dataset.cta}`, props);
  };
  document.addEventListener('click', onClick, { capture: true });
  return () => document.removeEventListener('click', onClick, { capture: true });
}

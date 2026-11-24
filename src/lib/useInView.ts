import { useEffect, useState, type RefObject } from 'react';

/** True while the element is within `margin` of the viewport. Used to lazy-mount and pause canvases. */
export function useInView(ref: RefObject<Element>, margin = '50% 0px', once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, once]);
  return inView;
}

/** Pauses render loops while the tab is hidden. */
export function usePageVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

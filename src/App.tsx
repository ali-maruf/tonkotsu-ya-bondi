import { useEffect } from 'react';
import { initCtaTracking } from './lib/analytics';
import { useMotion } from './lib/motion';
import { initSmoothScroll, scrollToHash } from './lib/scroll';
import { initReveals } from './lib/reveal';
import { tokens } from './lib/tokens';
import { Preloader } from './components/chapters/Preloader';
import { Hero } from './components/chapters/Hero';
import { Broth } from './components/chapters/Broth';
import { NoodlePull } from './components/chapters/NoodlePull';
import { Sushi } from './components/chapters/Sushi';
import { MenuShowcase } from './components/chapters/MenuShowcase';
import { MenuExplorer } from './components/chapters/MenuExplorer';
import { FindUs } from './components/chapters/FindUs';
import { Reviews } from './components/chapters/Reviews';
import { Header } from './components/layout/Header';
import { MobileBar } from './components/layout/MobileBar';
import { Footer } from './components/layout/Footer';
import { NorenOpener } from './components/ui/NorenOpener';

export default function App() {
  const { tier } = useMotion();

  useEffect(() => initCtaTracking(), []);
  useEffect(() => (tier === 'static' ? undefined : initSmoothScroll()), [tier]);
  useEffect(() => (tier === 'static' ? undefined : initReveals()), [tier]);

  // In-page anchors go through Lenis so they glide instead of jumping.
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || a.getAttribute('href') === '#') return;
      e.preventDefault();
      scrollToHash(a.getAttribute('href')!);
    };
    document.addEventListener('click', on);
    return () => document.removeEventListener('click', on);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only z-[200] rounded-full bg-washi-50 px-4 py-2 text-charcoal-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Preloader />
      <Header />
      <main id="main">
        <Hero />
        <Broth />
        <NoodlePull />
        <Sushi />
        <NorenOpener n="05" title="On the menu" jp="品書" glyphs={['品書', 'ラーメン']} />
        <MenuShowcase />
        <MenuExplorer />
        <NorenOpener n="07" title="Find us" jp="地図" glyphs={['地図', '豚骨屋']} color={tokens.nori900} />
        <FindUs />
        <NorenOpener n="08" title="Reviews" jp="声" glyphs={['声', '豚骨屋']} />
        <Reviews />
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}

import { useEffect, useState } from 'react';
import { Logo } from '../ui/Brand';
import { OpenStatusPill } from '../ui/OpenStatus';
import { OrderLink } from '../ui/OrderLink';

/** Sticky header: logo · Menu · Find Us · [Order Now]. Goes solid once the page scrolls. */
export function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${solid ? 'border-b border-washi-50/10 bg-charcoal-950/80 backdrop-blur-md' : 'border-b border-transparent'}`}
      style={{ height: 'var(--header-h)' }}
    >
      <div className="container-x flex h-full items-center justify-between gap-6">
        <a href="#top" aria-label="Tonkotsu Ya, back to top" data-cta="logo">
          <Logo compact />
        </a>
        <nav aria-label="Primary" className="flex items-center gap-1 md:gap-2">
          <a href="#menu" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-washi-50/80 transition-colors hover:text-washi-50 md:inline-flex" data-cta="nav_menu">
            Menu
          </a>
          <a href="#find-us" className="hidden rounded-full px-4 py-2 text-[13px] font-medium text-washi-50/80 transition-colors hover:text-washi-50 md:inline-flex" data-cta="nav_find_us">
            Find Us
          </a>
          <OpenStatusPill className="mx-3 hidden text-washi-50/70 lg:inline-flex" />
          <OrderLink location="header" className="btn-primary min-h-[40px] px-5 text-[12px]" />
        </nav>
      </div>
    </header>
  );
}

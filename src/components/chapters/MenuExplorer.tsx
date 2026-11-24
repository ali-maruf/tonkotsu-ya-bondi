import { useRef, useState, type KeyboardEvent } from 'react';
import { MENU_PLACEHOLDER, categories } from '../../lib/menu';
import { DishPhoto } from '../ui/DishPhoto';
import { OrderLink } from '../ui/OrderLink';
import { Ph } from '../ui/Ph';
import { track } from '../../lib/analytics';

/** Chapter 6: category rail (from menu.json) with crossfading panels. ARIA tabs with arrow-key support. */
export function MenuExplorer() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    setActive(i);
    track('menu_category', { category: categories[i].id });
    if (focus) tabs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const n = categories.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') select((active + 1) % n, true);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') select((active - 1 + n) % n, true);
    else if (e.key === 'Home') select(0, true);
    else if (e.key === 'End') select(n - 1, true);
    else return;
    e.preventDefault();
  };

  return (
    <section id="menu" aria-labelledby="menu-title" className="washi-texture relative py-24 text-charcoal-950 md:py-32">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label text-vermilion-600">06 · Menu</p>
            <h2 id="menu-title" data-reveal="deep" className="display mt-4 text-[clamp(2.2rem,5vw,4.2rem)]">
              The menu
            </h2>
          </div>
          <p className="max-w-sm text-[14px] text-charcoal-950/70">
            Dishes and prices <Ph value={MENU_PLACEHOLDER} />. Order any dish in one tap on Uber Eats.
          </p>
        </div>

        <div data-reveal role="tablist" aria-label="Menu categories" onKeyDown={onKey} className="-mx-[var(--gutter)] mt-10 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:px-0">
          {categories.map((c, i) => (
            <button
              key={c.id}
              ref={(b) => (tabs.current[i] = b)}
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${c.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-5 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${i === active ? 'border-charcoal-950 bg-charcoal-950 text-washi-50' : 'border-charcoal-950/20 text-charcoal-950/75 hover:border-charcoal-950/60'}`}
            >
              {c.label}
              <span className="jp text-[11px] opacity-60" aria-hidden="true">
                {c.jp}
              </span>
            </button>
          ))}
        </div>

        <div data-reveal className="relative mt-10">
          {categories.map((c, i) => (
            <div
              key={c.id}
              role="tabpanel"
              id={`panel-${c.id}`}
              aria-labelledby={`tab-${c.id}`}
              hidden={i !== active}
              className="grid animate-[fade-up_0.6s_var(--ease-out)_both] gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {c.items.map((item) => (
                <article key={item.id} className="flex gap-5 rounded-3xl border border-charcoal-950/10 bg-washi-50/70 p-5 transition-shadow duration-300 hover:shadow-[0_20px_40px_-24px_rgb(20_20_20/0.35)]">
                  <DishPhoto visual={item.visual} alt="" sizes="96px" className="h-24 w-24 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="font-display text-[17px] font-extrabold leading-snug">
                      <Ph value={item.name} />
                    </h3>
                    <span className="mt-1 text-[14px] font-semibold">
                      <Ph value={item.price} />
                    </span>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-950/70">
                      <Ph value={item.description} />
                    </p>
                    <OrderLink location="menu_explorer" item={item.id} className="btn-ghost-dark mt-4 min-h-[40px] self-start px-4 text-[11px]">
                      Order
                    </OrderLink>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
    </section>
  );
}

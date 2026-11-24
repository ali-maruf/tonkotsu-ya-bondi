import { DAY_KEYS, DAY_LABELS, HOURS_PLACEHOLDER, formatTime, rangesFor } from '../../lib/hours';
import { ADDRESS_LINE, DIRECTIONS_URL, site } from '../../lib/site';
import { Hanko, Logo } from '../ui/Brand';
import { OrderLink } from '../ui/OrderLink';
import { Ph } from '../ui/Ph';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-charcoal-950 pb-10 pt-24 text-washi-50">
      <span aria-hidden="true" className="jp pointer-events-none absolute -right-6 bottom-0 select-none text-[22vw] leading-none text-washi-50/[0.03]">
        豚骨屋
      </span>
      <div className="container-x relative grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-5">
            <Hanko className="h-16 w-16" />
            <Logo />
          </div>
          <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-washi-50/70">Ramen, sushi and Japanese meals. Dine in, take away or delivery.</p>
          <div className="mt-8">
            <OrderLink location="footer">Order on Uber Eats</OrderLink>
          </div>
        </div>
        <div className="md:col-span-3">
          <h2 className="label text-vermilion-400">Find us</h2>
          <address className="mt-4 text-[15px] not-italic leading-relaxed text-washi-50/80">
            Shop <Ph value={site.address.shop} />
            <br />
            {ADDRESS_LINE}
          </address>
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="mt-4 inline-block text-[14px] font-medium text-washi-50 underline decoration-vermilion-600 underline-offset-4" data-cta="directions" data-cta-location="footer">
            Get directions
          </a>
          <p className="mt-4 text-[14px] text-washi-50/70">
            Phone <Ph value={site.phone} />
          </p>
        </div>
        <div className="md:col-span-4">
          <h2 className="label text-vermilion-400">Hours</h2>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[14px] text-washi-50/75">
            {DAY_KEYS.map((d) => {
              const r = rangesFor(d);
              return (
                <div key={d} className="contents">
                  <dt>{DAY_LABELS[d].slice(0, 3)}</dt>
                  <dd>{r === null ? <span className="ph">{HOURS_PLACEHOLDER}</span> : r.length ? r.map((x) => `${formatTime(x.open)}–${formatTime(x.close)}`).join(', ') : 'Closed'}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
      <div className="container-x relative mt-20 flex flex-col justify-between gap-3 border-t border-washi-50/10 pt-6 text-[12px] text-washi-50/50 md:flex-row">
        <span>© {new Date().getFullYear()} Tonkotsu Ya, Bondi Junction</span>
        <span>Eastgate Shopping Centre · Spring Street · Bondi Junction NSW 2022</span>
        <span>Food imagery is AI-generated and illustrative; dishes may differ.</span>
      </div>
    </footer>
  );
}

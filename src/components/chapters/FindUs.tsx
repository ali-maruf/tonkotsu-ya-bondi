import { useRef } from 'react';
import { DAY_KEYS, DAY_LABELS, HOURS_PLACEHOLDER, formatTime, rangesFor, sydneyNow } from '../../lib/hours';
import { useMotion } from '../../lib/motion';
import { useScrollProgress } from '../../lib/scroll';
import { ADDRESS_LINE, DIRECTIONS_URL, MAP_EMBED_URL, PHONE_HREF, site } from '../../lib/site';
import { useInView } from '../../lib/useInView';
import { ChapterHeading } from '../ui/ChapterHeading';
import { OpenStatusPill } from '../ui/OpenStatus';
import { OrderLink } from '../ui/OrderLink';
import { Ph } from '../ui/Ph';

/** Chapter 7: schematic 3D floorplan cue, hours with today highlighted, lazy map and directions. */
export function FindUs() {
  const { tier } = useMotion();
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, { start: 'top bottom', end: 'bottom top', enabled: tier !== 'static', onUpdate: (p) => ref.current?.style.setProperty('--p', p.toFixed(4)) });
  const today = sydneyNow().day;

  return (
    <section id="find-us" ref={ref} aria-labelledby="find-title" className="relative bg-charcoal-950 py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ChapterHeading n="07" label="Find us" jp="地図" />
          <h2 id="find-title" data-reveal="deep" className="display mt-5 text-[clamp(2.2rem,5vw,4.2rem)]">
            Inside
            <br />
            Eastgate.
          </h2>
          <address className="mt-6 text-[16px] not-italic leading-relaxed text-washi-50/80">
            Shop <Ph value={site.address.shop} />, {ADDRESS_LINE}
          </address>
          <OpenStatusPill className="mt-5 text-washi-50/80" />

          <table data-reveal className="mt-8 w-full max-w-sm text-[14px]">
            <caption className="label mb-3 text-left text-washi-50/60">Opening hours (Sydney time)</caption>
            <tbody>
              {DAY_KEYS.map((d) => {
                const r = rangesFor(d);
                const isToday = d === today;
                return (
                  <tr key={d} aria-current={isToday ? 'date' : undefined} className={`border-b border-washi-50/10 ${isToday ? 'text-washi-50' : 'text-washi-50/65'}`}>
                    <th scope="row" className="py-2.5 text-left font-medium">
                      <span className="inline-flex items-center gap-2">
                        {isToday && <span className="h-1.5 w-1.5 rounded-full bg-vermilion-600" aria-hidden="true" />}
                        {DAY_LABELS[d]}
                        {isToday && <span className="label text-[9px] text-vermilion-400">Today</span>}
                      </span>
                    </th>
                    <td className="py-2.5 text-right">{r === null ? <span className="ph">{HOURS_PLACEHOLDER}</span> : r.length ? r.map((x) => `${formatTime(x.open)}–${formatTime(x.close)}`).join(', ') : 'Closed'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="btn-ghost" data-cta="directions" data-cta-location="find_us">
              Directions
            </a>
            {PHONE_HREF ? (
              <a href={PHONE_HREF} className="btn-ghost" data-cta="call" data-cta-location="find_us">
                Call {site.phone}
              </a>
            ) : (
              <span className="btn-ghost cursor-not-allowed opacity-60" aria-disabled="true">
                Call&nbsp;<span className="ph">{site.phone}</span>
              </span>
            )}
            <OrderLink location="find_us" />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-7">
          <Floorplan />
          <LazyMap />
        </div>
      </div>
    </section>
  );
}

/** Minimal 3D cue of the centre (schematic, not to scale) with a pulsing pin. */
function Floorplan() {
  return (
    <figure data-reveal="card" data-reveal-i="1" className="relative">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-washi-50/10 bg-[radial-gradient(ellipse_at_center,#262626,#141414_70%)]" style={{ perspective: '1100px' }}>
        <div
          className="absolute left-1/2 top-1/2 h-[78%] w-[70%]"
          style={{ transform: 'translate(-50%,-46%) rotateX(56deg) rotateZ(calc(-28deg + var(--p, 0.5) * 12deg))', transformStyle: 'preserve-3d' }}
        >
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <rect x="0" y="0" width="400" height="300" rx="18" fill="#1d1d1d" stroke="rgb(250 248 243 / 0.35)" strokeWidth="2" />
            <g fill="#262626" stroke="rgb(250 248 243 / 0.12)">
              <rect x="22" y="22" width="110" height="80" rx="6" />
              <rect x="146" y="22" width="90" height="80" rx="6" />
              <rect x="250" y="22" width="128" height="80" rx="6" />
              <rect x="22" y="190" width="150" height="88" rx="6" />
              <rect x="186" y="190" width="80" height="88" rx="6" />
              <rect x="280" y="190" width="98" height="88" rx="6" />
            </g>
            <path d="M22 146h356" stroke="rgb(250 248 243 / 0.18)" strokeWidth="26" strokeLinecap="round" />
            <text x="200" y="151" textAnchor="middle" fill="rgb(250 248 243 / 0.45)" fontSize="11" letterSpacing="4" fontFamily="Inter, sans-serif">
              EASTGATE
            </text>
            <path d="M-20 330h440" stroke="rgb(250 248 243 / 0.25)" strokeWidth="14" />
            <text x="200" y="358" textAnchor="middle" fill="rgb(250 248 243 / 0.55)" fontSize="13" letterSpacing="5" fontFamily="Inter, sans-serif">
              SPRING STREET
            </text>
          </svg>
          <div className="absolute" style={{ left: '62%', top: '43%', transformStyle: 'preserve-3d' }}>
            <span className="pin-pulse absolute left-0 top-0 h-16 w-16 rounded-full border-2 border-vermilion-600" />
            <span className="pin-pulse absolute left-0 top-0 h-16 w-16 rounded-full border-2 border-vermilion-600" style={{ animationDelay: '1.1s' }} />
            <div className="absolute bottom-0 left-0 origin-bottom" style={{ transform: 'translateX(-50%) rotateZ(calc(28deg - var(--p, 0.5) * 12deg)) rotateX(-56deg)' }}>
              <div className="flex flex-col items-center">
                <span className="whitespace-nowrap rounded-full bg-vermilion-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-washi-50 shadow-[0_10px_30px_-8px_rgb(215_57_43/0.8)]">
                  Tonkotsu Ya · {site.address.shop}
                </span>
                <span className="h-8 w-0.5 bg-vermilion-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[12px] text-washi-50/50">
        Schematic only, not to scale. Shop position <span className="ph">{site.address.shop}</span> to be confirmed.
      </figcaption>
    </figure>
  );
}

/** The Google map iframe is only created once the block nears the viewport. */
function LazyMap() {
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, '200px 0px', true);
  return (
    <div ref={ref} data-reveal="card" data-reveal-i="2" className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-washi-50/10 bg-charcoal-800">
      {show ? (
        <iframe
          title="Map of Eastgate Shopping Centre, Bondi Junction"
          src={MAP_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
          style={{ filter: 'grayscale(1) invert(0.92) contrast(0.9)' }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[13px] text-washi-50/50">Loading map…</div>
      )}
    </div>
  );
}

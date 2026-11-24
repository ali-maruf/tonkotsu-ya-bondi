import { DIRECTIONS_URL, PHONE_HREF, site } from '../../lib/site';
import { OrderLink } from '../ui/OrderLink';

const icon = 'h-5 w-5';

/** Mobile bottom bar: [Call] [Directions] [Order Now]. */
export function MobileBar() {
  return (
    <nav aria-label="Quick actions" className="fixed inset-x-0 bottom-0 z-50 border-t border-washi-50/10 bg-charcoal-950/[0.97] md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid h-[var(--bottom-bar-h)] grid-cols-[1fr_1fr_1.4fr] items-center gap-2 px-3">
        {PHONE_HREF ? (
          <a href={PHONE_HREF} className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-washi-50/85" data-cta="call" data-cta-location="mobile_bar">
            <PhoneIcon />
            Call
          </a>
        ) : (
          <span className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-washi-50/40" aria-disabled="true" title={`Phone number pending: ${site.phone}`}>
            <PhoneIcon />
            Call
          </span>
        )}
        <a href={DIRECTIONS_URL} target="_blank" rel="noopener" className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-washi-50/85" data-cta="directions" data-cta-location="mobile_bar">
          <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          Directions
        </a>
        <OrderLink location="mobile_bar" className="btn-primary min-h-[44px] px-3 text-[12px]" />
      </div>
    </nav>
  );
}

function PhoneIcon() {
  return (
    <svg className={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

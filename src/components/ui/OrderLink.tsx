import type { ReactNode } from 'react';
import { ORDER_URL } from '../../lib/site';

/** Every order button: one tap to Uber Eats, tracked through data-cta. */
export function OrderLink({ location, item, className = 'btn-primary', children = 'Order Now' }: { location: string; item?: string; className?: string; children?: ReactNode }) {
  return (
    <a href={ORDER_URL} target="_blank" rel="noopener" className={className} data-cta="order" data-cta-location={location} data-cta-item={item}>
      {children}
      <span className="sr-only"> (opens Uber Eats in a new tab)</span>
    </a>
  );
}

import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import site from './src/data/site.json';
import hours from './src/data/hours.json';

const isPlaceholder = (v: unknown) => typeof v !== 'string' || /\{\{.+\}\}/.test(v);

/** Builds Restaurant JSON-LD from the data files, leaving out anything still a placeholder. */
function restaurantJsonLd(): Plugin {
  return {
    name: 'restaurant-json-ld',
    transformIndexHtml(html) {
      const a = site.address;
      const street = [isPlaceholder(a.shop) ? null : `Shop ${a.shop}`, a.centre, a.street].filter(Boolean).join(', ');
      const dayNames: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
      const spec = Object.entries(hours.days as Record<string, { open: string; close: string }[] | null>).flatMap(([d, ranges]) =>
        (ranges ?? []).map((r) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: dayNames[d], opens: r.open, closes: r.close })),
      );
      const ld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: `${site.name} (${site.branch})`,
        servesCuisine: site.cuisine,
        address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: a.suburb, addressRegion: a.state, postalCode: a.postcode, addressCountry: a.country },
        potentialAction: { '@type': 'OrderAction', target: site.orderUrl, deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet' },
        sameAs: [site.orderUrl],
      };
      if (!isPlaceholder(site.phone)) ld.telephone = site.phone;
      if (!isPlaceholder(site.siteUrl)) ld.url = site.siteUrl;
      if (spec.length) ld.openingHoursSpecification = spec;
      return html.replace('<!--JSON_LD-->', `<script type="application/ld+json">${JSON.stringify(ld)}</script>`);
    },
  };
}

export default defineConfig({
  plugins: [react(), restaurantJsonLd()],
  // WebGL code (three, R3F, drei) is only reached through dynamic import(), so Rollup keeps it out of the entry chunk.
  build: { target: 'es2020', chunkSizeWarningLimit: 1200 },
});

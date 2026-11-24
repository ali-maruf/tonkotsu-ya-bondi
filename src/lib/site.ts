import site from '../data/site.json';
import { isPlaceholder } from './placeholder';

export { site };

export const ORDER_URL = site.orderUrl;

const a = site.address;
export const ADDRESS_LINE = `${a.centre}, ${a.street}, ${a.suburb} ${a.state} ${a.postcode}`;

const destination = encodeURIComponent(`${site.name}, ${a.centre}, ${a.street}, ${a.suburb} ${a.state} ${a.postcode}`);
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(`${a.centre}, ${a.suburb} ${a.state} ${a.postcode}`)}&output=embed`;

export const PHONE_HREF = isPlaceholder(site.phone) ? null : `tel:${site.phone.replace(/[^+\d]/g, '')}`;

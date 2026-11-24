import menu from '../data/menu.json';

export type MenuItem = { id: string; name: string; description: string; price: string; visual: string; featured?: boolean };
export type MenuCategory = { id: string; label: string; jp: string; items: MenuItem[] };

export const MENU_PLACEHOLDER = menu.placeholder;
export const categories = menu.categories as MenuCategory[];
export const featured = categories.flatMap((c) => c.items.filter((i) => i.featured).map((i) => ({ ...i, category: c })));

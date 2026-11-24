# Tonkotsu Ya — Bondi Junction (front end)

A scroll-driven, single-page front end for **Tonkotsu Ya**, inside Eastgate Shopping Centre, Spring Street, Bondi Junction NSW 2022.
It covers dine-in, takeaway and delivery, and every order button goes to Uber Eats.

> **Status: proposal build.** The identity is new and unapproved. Every business fact that hasn't been confirmed is a visible `{{PLACEHOLDER}}` chip on the page. Nothing is invented. See [Owner sign-off](#owner-sign-off) below.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, then a static build in dist/
npm run preview    # serve dist/
```

`dist/` is a static site that any host can serve (Netlify, Vercel, S3, Cloudflare Pages).

**Testing flags:** `?tier=high`, `?tier=low` and `?tier=static` force a rendering tier. `?lite=1` forces static.

## Stack

Vite, React 18, TypeScript, Tailwind 3, React Three Fiber and drei, three.js, GSAP ScrollTrigger, Lenis.

## Structure

```
public/assets/logo-tonkotsuya.svg   proposed logo (slot: replace with the approved file)
src/data/site.json                  name, address, phone, order URL, broth hours, story
src/data/menu.json                  categories + items (all placeholders)
src/data/hours.json                 opening hours, Australia/Sydney (all placeholders)
src/data/reviews.json               Google rating + 5 reviews (all placeholders)
src/styles/tokens.css               colour tokens (mirrored for WebGL in src/lib/tokens.ts)
src/lib/                            hours/open-status, analytics stub, scroll (Lenis + ScrollTrigger), motion tiers
src/components/chapters/            one component per chapter
src/components/three/               BowlModel (GLB), noren shader (lazy-loaded)
public/media/                       Higgsfield photos, video frame sequences, ramen-bowl.glb
src/components/ui/                  logo, hanko seal, noren, dish art, placeholder chip, lazy stage
src/components/layout/              sticky header, mobile bottom bar, footer
```

### Chapters

| # | Component | What happens |
|---|-----------|--------------|
| 0 | `Preloader` | A hanko stamp presses the bowl mark onto washi. Plays once per session and is skipped for reduced motion. |
| 1 | `Hero` + `ui/FilmStage` | Pinned for 280vh. The noren swings open in 3D onto a real bowl, then scroll drives a camera orbit around it (91 video frames, forwards and backwards). The headline tips back into depth and the **TONKOTSU YA** wordmark flies forward at the end. |
| 2 | `Broth` + `ui/FilmStage` | Pinned for 220vh. A crane shot rises over the boiling stockpot into the broth as you scroll, while the clock sweeps. |
| 3 | `NoodlePull` + `ui/FrameScrub` | Pinned for 200vh. A real slow-motion noodle lift (81 video frames) scrubbed by scroll, forwards and backwards. |
| 4 | `Sushi` + `ui/FilmStage` | A cream chapter. A macro tracking shot glides along the maki as you scroll. |
| 5 | `MenuShowcase` | A pinned horizontal gallery. The first card is a **real textured 3D ramen bowl** (`three/BowlModel`, drag to rotate); then the `featured` items in `menu.json` as photos that turn as you scroll. Cards swing through a 3D coverflow as they cross the centre. |
| 6 | `MenuExplorer` | A category rail of ARIA tabs (arrow keys, Home/End) that crossfades between panels, with a photo per dish. |
| 7 | `FindUs` | A schematic CSS-3D floorplan with a pulsing pin, hours with today highlighted (Sydney time), live open status, a lazy-loaded map and directions. |
| 8 | `Reviews` | Placeholder rating and five placeholder review cards. |
| – | `Footer` | Charcoal, with the hanko seal, location, hours and the AI-imagery note. |

Chapters 5, 7 and 8 open with a `NorenOpener` band, and the pinned film chapters open with a 3D CSS noren (`ui/CssNoren`, hinged panels on `rotateY`). Headings, tables, cards and reviews below the fold tilt up out of the page in 3D as they scroll in (`data-reveal`, `src/lib/reveal.ts`). `SteamDivider` wisps connect the chapters.

### Realistic media (Higgsfield)

All photographic media was generated with the Higgsfield connector and lives in `public/media/`. Paths are listed in `src/lib/media.ts`.

| Asset | Model | Used in |
|-------|-------|---------|
| Hero (16:9 and 9:16), broth, noodle, sushi photos | GPT Image 2.6, 2K | First paint and the static fallback for chapters 1–4 |
| Hero orbit, broth crane, sushi tracking videos, 5s 720p → ~91 WebP frames each | Seedance 2.5 (start frame = the photo) | Chapters 1, 2, 4 |
| Eight top-down dish photos | GPT Image 2.6 | Showcase and menu explorer, by `visual` |
| Noodle lift video, 5s 720p → 81 WebP frames | Seedance 2.5 | Chapter 3 |
| Textured PBR ramen bowl, GLB, 13 MB → 1.0 MB | Meshy image-to-3D, then `gltf-transform` | Showcase 3D card |

**This imagery is illustrative AI art, not photography of Tonkotsu Ya's own dishes.** The footer says so. Replace it with real photos and footage before launch: keep the filenames, or update `src/lib/media.ts`. A real camera move can replace any film: extract frames at ~18 fps, 1280px wide, as `NNN.webp`, and set `count`.

`FilmStage` + `FrameScrub` draw the frame for the current scroll position to a canvas (cover-fit), so each camera move plays forwards and backwards with the reader. Frames load only when the chapter nears the viewport: every 8th frame first, then the gaps.

### Conversion system

- **Sticky header:** logo · Menu · Find Us · live open status · **Order Now**.
- **Mobile bottom bar:** Call · Directions · **Order Now**. Call stays disabled until `{{PHONE}}` is set.
- **One-tap ordering:** every dish has an Order link to Uber Eats that opens in a new tab.
- **Analytics:** every conversion element carries `data-cta` (plus `data-cta-location` and `data-cta-item`). One delegated listener calls `track()` in `src/lib/analytics.ts`, which pushes to `window.dataLayer` and logs in dev. Replace the body of `track()` with GA4, Meta or Plausible.
- **Open/closed status:** computed in `Australia/Sydney` from `hours.json`, whatever the visitor's own timezone. It handles ranges that run past midnight and re-checks every minute.

### Performance and accessibility

- **Lazy 3D:** three.js, R3F and drei are only reached through dynamic `import()`. The entry chunk (React, GSAP, Lenis, app) is about 111 KB gzipped. The hero scene waits for page load plus idle, so the LCP element (the `<h1>`) is plain text.
- **Canvases:** each mounts only near the viewport, unmounts when far away, and pauses (`frameloop="never"`) when off-screen or the tab is hidden.
- **Media weight:** scene photos are WebP at 1280/1920px (100–220 KB each). The hero photo is the LCP image, with `fetchpriority=high`. Film frames (about 2.5–4 MB per chapter) and the GLB (1 MB) load only when their section nears the viewport.
- **Three tiers** (`src/lib/motion.tsx`):
  - **high / low:** scroll-scrubbed films, 3D noren and reveals; low caps the WebGL DPR at 1.5.
  - **static:** reduced motion, no WebGL, Save-Data or `?lite=1`. No canvases, no pinning, no smooth scroll; the same photos as plain responsive images.
- **Layout stability:** pinned sections use CSS `position: sticky` with fixed heights, so nothing shifts layout. Scroll progress is scrubbed and reversible.
- **Accessibility:** skip link, landmarks, AA colour pairs (small accent text on charcoal uses `--vermilion-400`), visible focus rings, decorative canvases marked `aria-hidden` with the same content in real text, and 44px+ tap targets.
- **Fonts:** Japanese glyphs are decorative only. Noto Sans JP is subset with Google Fonts `text=` to the characters the site uses.

**Not yet measured:** the targets are Lighthouse mobile ≥ 90, LCP < 2.5s and CLS < 0.05. Run Lighthouse against `npm run preview` on real devices before launch.

### SEO

- The title is set exactly as specified: *Tonkotsu Ya | Ramen & Sushi | Eastgate, Bondi Junction*.
- Restaurant JSON-LD (`servesCuisine: ["Japanese", "Ramen"]`) is generated at build time by a small Vite plugin in `vite.config.ts` from `site.json` and `hours.json`.
- Fields that are still placeholders (phone, shop number, hours, URL) are left out of the JSON-LD so search engines never see `{{…}}`. They appear automatically once filled in.

## Owner sign-off

### Needs confirmation

| Item | Where | Note |
|------|-------|------|
| Business name spelling and branding ("Tonkotsu Ya") | everywhere | Confirm capitalisation and spacing, and whether "Tonkotsu-Ya" or "TONKOTSU YA" is preferred. |
| Shop number `{{SHOP_NUMBER}}` | `site.json` → `address.shop` | Also confirm the pin position on the schematic floorplan (`FindUs.tsx`, currently indicative). |
| Logo | `public/assets/logo-tonkotsuya.svg`, `ui/Brand.tsx` | A **new proposed identity**: bowl-and-steam symbol, "TONKOTSU YA" wordmark, "BONDI JUNCTION" between hairlines. Outline the SVG text before production. |
| Brand story `{{STORY}}` | `site.json` → `story` | Suggested theme to confirm: rich, milky Hakata-style pork-bone broth. |
| Broth copy | `Broth.tsx` | Describes tonkotsu in general (pork bones simmered until milky). Confirm it matches how the shop makes it. |
| Menu categories | `menu.json` | Ramen, Sushi, Japanese Meals, Sides, Drinks. Confirm which exist. |
| Food imagery | `public/media/` | AI-generated and illustrative, not the shop's real dishes. Replace with real photography before launch. |

### Placeholders to fill in

| Token | File |
|-------|------|
| `{{SHOP_NUMBER}}` | `src/data/site.json` |
| `{{PHONE}}` | `src/data/site.json` |
| `{{HOURS}}` | `src/data/hours.json`: replace each `null` with `[{"open":"11:00","close":"21:00"}]`, or use `[]` for closed |
| `{{MENU_AND_PRICES}}` | `src/data/menu.json`: every `{{<CATEGORY>_<n>_NAME / _DESCRIPTION / _PRICE}}` |
| `{{GOOGLE_RATING}}`, `{{GOOGLE_REVIEW_COUNT}}`, `{{GOOGLE_REVIEWS_URL}}` | `src/data/reviews.json` |
| `{{REVIEW_1}}` … `{{REVIEW_5}}` and `{{REVIEW_n_AUTHOR}}` | `src/data/reviews.json`. Use verified reviews only, with permission. |
| `{{BROTH_HOURS}}` | `src/data/site.json`. Set a number (e.g. `"12"`) and the simmer clock counts up to it. |
| `{{STORY}}` | `src/data/site.json` |
| `{{SITE_URL}}` | `src/data/site.json`, for canonical / JSON-LD `url`. Also add `<link rel="canonical">` and an OG image in `index.html` once the domain is known. |

**Confirmed and used as given:** the address (Eastgate Shopping Centre, Spring Street, Bondi Junction NSW 2022), the services (dine-in, takeaway, delivery) and the Uber Eats URL.

Any value that still matches `{{…}}` renders as a dashed chip (`ui/Ph.tsx`), so gaps are obvious in review. Once a real value is in the JSON, it renders as normal text with no code change.

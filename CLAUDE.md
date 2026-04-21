# Dalia Cordeiro Site — Claude Code Instructions

## Project Overview

Portfolio website for a Portuguese visual artist. Monorepo with two workspaces:
- `web/` — Astro 5 static site (SSG), React islands for interactivity
- `studio/` — Sanity Studio v3 (CMS admin panel)

**Sanity project**: `gwtbwm5k`, dataset: `production`
**Deploy**: Cloudflare Pages (`dalia-cordeiro.pages.dev`)
**Domain target**: `daliacordeiro.art`

## Key Commands

```bash
pnpm dev:web          # Astro dev server → localhost:4321
pnpm dev:studio       # Sanity Studio → localhost:3333
pnpm build:web        # Build static site to web/dist/
node scripts/import-from-data.js  # Migrate prototype data → Sanity (idempotent)
wrangler pages deploy web/dist --project-name dalia-cordeiro  # Deploy to CF Pages
```

## Architecture Rules

- **Static output only** (`output: 'static'`). No SSR, no Cloudflare adapter.
- **React islands** (`client:load`) only for interactive components: `WorkGrid.tsx` (filters, modal) and `ContactForm.tsx` (form submission). Everything else is `.astro` (zero client JS).
- **Sanity data fetched at build time** via GROQ queries in `web/src/lib/queries.ts`. Image URLs pre-computed server-side via `urlFor()`.
- **CSS is vanilla** — no Tailwind, no CSS-in-JS. All styles in `web/src/styles/global.css`. Themes and accents via CSS custom properties on `<body>` class.
- **Fonts are self-hosted** WOFF2 in `web/public/fonts/`. Never use Google Fonts CDN link.

## i18n Conventions

- Two languages: `pt` (default) and `en`.
- Routes: `/pt/`, `/pt/sobre`, `/pt/contacto` ↔ `/en/`, `/en/about`, `/en/contact`.
- Route map defined in `web/src/lib/i18n.ts` → `routes` object.
- UI strings: static dict in `web/src/lib/i18n.ts` → `ui` object. Use `t(lang, key)`.
- CMS fields: `localizedString` / `localizedText` objects with `{pt, en}` sub-fields.
- Resolve localized fields with `loc(field, lang)` from `web/src/lib/helpers.ts`. Always falls back to PT.
- Series names: static dict in `i18n.ts` → `seriesNames`. Not stored localized in Sanity.
- hreflang alternates on every page via `Base.astro`. `x-default` → `/pt/`.

## Sanity Schema Patterns

- **Singletons**: `about` and `siteSettings` use fixed `_id` (same as type name). Configured in `sanity.config.ts` to prevent duplicate creation and hide delete action.
- **Localized fields**: use custom object types `localizedString`, `localizedText`, `localizedRichText` from `studio/schemas/objects/localizedString.ts`.
- **`@sanity/language-filter`** plugin shows PT/EN tabs in Studio.
- **Field labels in Portuguese** (e.g., "Titulo", "Tecnica", "Dimensoes").
- **Series as enum string** on artwork, not a separate document type. Values are English keys: `Metamorphoses`, `Works on Paper`, `Saints & Weeds`, `Portraits`, `Bestiary`.

## File Conventions

- Page files: one per route per language. e.g., `pages/pt/sobre.astro` and `pages/en/about.astro`.
- Each page fetches its own Sanity data in the frontmatter.
- Components that need client interactivity: `.tsx` (React). Static components: `.astro`.
- Types for CMS data: `web/src/lib/types.ts`. Keep in sync with Sanity schemas.

## When Adding New Pages

1. Create `pages/pt/<slug-pt>.astro` and `pages/en/<slug-en>.astro`
2. Add routes to `web/src/lib/i18n.ts` → `routes` object
3. Update `Header.astro` nav links
4. Update `Base.astro` alternate URL mapping (the `if/else` chain for hreflang)
5. Build and verify hreflang is correct in output HTML

## When Adding New Sanity Fields

1. Add field to schema in `studio/schemas/`
2. Add TypeScript type to `web/src/lib/types.ts`
3. Update GROQ query in `web/src/lib/queries.ts` if needed
4. Use `loc(field, lang)` for localized fields in templates

## Testing Checklist

Before deploying, verify:
- `pnpm build:web` succeeds with no errors
- All 7 pages generated (check build output)
- Sitemap generated (`dist/sitemap-index.xml`)
- Check a PT and EN page in `dist/` for correct hreflang, content, and image URLs
- Image URLs point to `cdn.sanity.io` with `?w=...&auto=format`

## Environment Variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `SANITY_PROJECT_ID` | `web/` build-time | `gwtbwm5k` |
| `SANITY_DATASET` | `web/` build-time | `production` |
| `SANITY_API_TOKEN` | `scripts/` only | Editor token for migration script. Not needed for read-only builds (public dataset) |
| `PUBLIC_WEB3FORMS_KEY` | `web/` client-side | Exposed to browser (prefix `PUBLIC_`). Needed for contact form |

## Do NOT

- Do not add SSR or server adapter — site must stay fully static
- Do not use Tailwind or any CSS framework — the design system is custom CSS
- Do not inline Sanity client in React islands — pass data as serialized props from Astro
- Do not create artwork detail pages (decision: modal-only, no `/galeria/[slug]` routes)
- Do not add the Tweaks panel from the prototype — it was for prototyping only
- Do not load fonts from Google Fonts CDN — they are self-hosted

# AGENT.md — Dalia Cordeiro Site

Context and conventions for AI coding agents working in this repo. Any AI assistant (Claude Code, Cursor, Aider, Continue, etc.) should read this file first.

---

## Project Overview

Portfolio website for **Dalia Cordeiro**, a Portuguese visual artist (oil, pastel, mixed media). Bilingual (PT/EN), CMS-editable, fully static.

Monorepo with two workspaces:

- `web/` — Astro 5 static site (SSG), React islands for interactivity
- `studio/` — Sanity Studio v3 (CMS admin panel)

**Live targets**:
- Production domain (canonical): `https://www.daliacordeiroart.com` (configured in `web/astro.config.ts`). Apex `daliacordeiroart.com` 301-redirects to www via Cloudflare Redirect Rule at the zone level.
- Cloudflare Pages project: `dalia-cordeiro-site` → `dalia-cordeiro-site.pages.dev` (this URL 301-redirects to the canonical domain via the Pages Function at `functions/_middleware.js`; static-file `_redirects` host matching is not honoured for the project's bare *.pages.dev URL).
- Sanity Studio: `https://daliacordeiro.sanity.studio`

**Sanity**: project `gwtbwm5k`, dataset `production`, org `oMtlogN6C`.

---

## Architecture

```
Browser ──► Cloudflare Pages (static HTML/CSS/JS)
                 │
                 │  build-time fetch (GROQ)
                 ▼
            Sanity CDN (content + images)
                 │
                 │  runtime POST (client-side)
                 ▼
            Web3Forms (contact form)
```

Site is **fully static** — no server runtime. Content fetched from Sanity at build time and baked into HTML. Client-side JS limited to artwork grid filters, modal, and contact form.

### Tech stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Astro 5 | SSG, routing, i18n, sitemap |
| UI islands | React 19 | `WorkGrid.tsx`, `ContactForm.tsx` only |
| CMS | Sanity v3 | Field-level PT/EN translation |
| Styling | Vanilla CSS | Themes + accents via CSS custom properties |
| Fonts | Newsreader + Inter Tight | Self-hosted WOFF2 (latin + latin-ext) |
| Hosting | Cloudflare Pages | Git integration, auto-deploy |
| Contact | Web3Forms | Client-side POST, no backend |
| Monorepo | pnpm workspaces | `web/` + `studio/` |

---

## Key Commands

```bash
pnpm install                       # Install workspace deps
pnpm dev:web                       # Astro dev server → http://localhost:4321
pnpm dev:studio                    # Sanity Studio   → http://localhost:3333
pnpm build:web                     # Build static site to web/dist/
pnpm build:studio                  # Build Studio (rarely needed locally)
node scripts/import-from-data.js   # Migrate prototype data → Sanity (idempotent)
wrangler pages deploy web/dist --project-name dalia-cordeiro-site   # Manual CF deploy
```

---

## Folder Structure

```
dalia-cordeiro-site/
├── web/                                # Astro site
│   ├── astro.config.ts                 # SSG, sitemap (i18n), React integration
│   ├── public/fonts/                   # Self-hosted WOFF2
│   └── src/
│       ├── components/
│       │   ├── Header.astro            # Nav + lang switch
│       │   ├── Hero.astro              # Homepage hero (CMS-driven)
│       │   ├── Footer.astro
│       │   ├── WorkGrid.tsx            # React island: grid + filters + modal + Load more (24-batch)
│       │   └── ContactForm.tsx         # React island: Web3Forms form
│       ├── layouts/Base.astro          # HTML shell, hreflang, OG, font preload
│       ├── lib/
│       │   ├── sanity.ts               # Client + image URL builder
│       │   ├── queries.ts              # GROQ queries
│       │   ├── i18n.ts                 # Languages, UI strings, route map
│       │   ├── types.ts                # TS types mirroring Sanity schemas
│       │   └── helpers.ts              # loc() — localized field with PT fallback
│       ├── pages/
│       │   ├── index.astro             # Root redirect (Accept-Language)
│       │   ├── 404.astro               # Bilingual 404 (CF Pages serves as fallback)
│       │   ├── pt/{index,sobre,contacto,termos}.astro
│       │   └── en/{index,about,contact,terms}.astro
│       └── styles/{global,fonts}.css
│
├── functions/                          # CF Pages Functions (repo root, NOT inside web/)
│   └── _middleware.js                  # Redirect bare *.pages.dev → canonical www
│
├── studio/                             # Sanity Studio
│   ├── sanity.config.ts                # Structure, language filter, singletons
│   ├── sanity.cli.ts                   # studioHost: 'daliacordeiro'
│   └── schemas/
│       ├── artwork.ts
│       ├── series.ts                   # Series document (orderRank, drag-to-reorder)
│       ├── about.ts                    # Singleton
│       ├── siteSettings.ts             # Singleton
│       └── objects/localizedString.ts  # localizedString/Text/RichText
│
├── scripts/import-from-data.js         # Idempotent migration script
├── prototype/                          # Original React-CDN prototype (reference)
├── docs/WORKFLOW.md                    # PT-language content/deploy workflow
├── docs/manual-site-dalia-cordeiro.pdf # Handover manual for the artist
├── package.json + pnpm-workspace.yaml
└── .env.example
```

---

## Architecture Rules (do not violate)

- **Static output only** (`output: 'static'`). No SSR, no Cloudflare adapter. The single Pages Function at `functions/_middleware.js` is a CF-platform addition for the *.pages.dev → www redirect — it does NOT change Astro's output mode and must not grow into request-handling logic.
- **React islands** (`client:load`) only for `WorkGrid.tsx` and `ContactForm.tsx`. Everything else is `.astro` (zero client JS).
- **Sanity data fetched at build time** via GROQ queries in `web/src/lib/queries.ts`. Image URLs pre-computed server-side via `urlFor()`.
- **Pass data as serialized props from Astro to React islands.** Never inline the Sanity client inside a React island.
- **CSS is vanilla** — no Tailwind, no CSS-in-JS. All styles in `web/src/styles/global.css`. Themes/accents via CSS custom properties on `<body>`.
- **Fonts are self-hosted** WOFF2 in `web/public/fonts/`. Never use Google Fonts CDN.
- **Modal-only artwork detail.** No `/galeria/[slug]` routes (decision: artist preferred simplicity over per-work SEO).
- **Theme hardcoded** to `theme-paper accent-coral` in production. The other themes/accents exist in CSS but have no UI toggle.

---

## i18n Conventions

- Two languages: `pt` (default) and `en`.
- Routes: `/pt/`, `/pt/sobre`, `/pt/contacto` ↔ `/en/`, `/en/about`, `/en/contact`.
- Route map: `web/src/lib/i18n.ts` → `routes` object.
- UI strings: static dict in `i18n.ts` → `ui` object. Use `t(lang, key)`.
- CMS fields: `localizedString` / `localizedText` objects with `{pt, en}` sub-fields.
- Resolve localized fields with `loc(field, lang)` from `web/src/lib/helpers.ts`. Always falls back to PT.
- Series are a Sanity document type (`series`) with `orderRank` for drag-to-reorder. Artwork references a series via an **optional** `series` reference field — works without one are "standalone" and surface in a dedicated filter group in `WorkGrid.tsx`.
- hreflang alternates on every page via `Base.astro`. `x-default` → `/pt/`.

---

## Sanity Schema Patterns

- **Singletons**: `about` and `siteSettings` use fixed `_id` (same as type name). Configured in `sanity.config.ts` to prevent duplicate creation and hide delete action.
- **Localized fields**: use custom object types `localizedString`, `localizedText`, `localizedRichText` (see `studio/schemas/objects/localizedString.ts`).
- **`@sanity/language-filter`** plugin shows PT/EN tabs in Studio.
- **Field labels in Portuguese** (e.g., "Titulo", "Tecnica", "Dimensoes") — the artist edits in PT.
- `siteSettings` holds `heroHeadline`, `heroIntro`, and `heroArtwork` so the artist can edit hero image + text without code changes. `heroIntro` has **no hardcoded fallback** — if unset in Studio, the homepage simply omits the intro paragraph.

---

## File Conventions

- Page files: one per route per language (`pages/pt/sobre.astro` and `pages/en/about.astro`).
- Each page fetches its own Sanity data in the frontmatter.
- Components needing client interactivity: `.tsx` (React). Static components: `.astro`.
- Types for CMS data: `web/src/lib/types.ts`. Keep in sync with Sanity schemas.

### When adding a new page

1. Create `pages/pt/<slug-pt>.astro` and `pages/en/<slug-en>.astro`.
2. Add routes to `web/src/lib/i18n.ts` → `routes`.
3. Update nav links in `Header.astro`.
4. Update alternate URL mapping in `Base.astro` (the `if/else` chain for hreflang).
5. Build and verify hreflang in output HTML.

### When adding a new Sanity field

1. Add field to schema in `studio/schemas/`.
2. Add TypeScript type to `web/src/lib/types.ts`.
3. Update GROQ query in `web/src/lib/queries.ts` if needed.
4. Use `loc(field, lang)` for localized fields in templates.

---

## Testing Checklist

Before deploying:

- [ ] `pnpm build:web` succeeds with no errors.
- [ ] All 7 pages generated (root redirect + 3 PT + 3 EN).
- [ ] Sitemap generated (`dist/sitemap-index.xml`).
- [ ] Spot-check a PT and EN page in `dist/` for correct hreflang, content, image URLs.
- [ ] Image URLs point to `cdn.sanity.io` with `?w=...&auto=format`.

---

## Environment Variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `SANITY_PROJECT_ID` | `web/` build-time | `gwtbwm5k` |
| `SANITY_DATASET` | `web/` build-time | `production` |
| `SANITY_API_TOKEN` | `scripts/` only | Editor token for migration script. Public dataset → not needed for read-only builds. |
| `PUBLIC_WEB3FORMS_KEY` | `web/` client-side | Exposed to browser (the `PUBLIC_` prefix is the Astro convention). Web3Forms access keys are not secrets. |

In Cloudflare Pages, additionally: `NODE_VERSION=20`, `PNPM_VERSION=9`.

---

## Deploy

### Auto-deploy chain (current)

```
Code push to main ──┐
                    ├──► Cloudflare Pages git integration ──► build + deploy (~1-2 min)
Sanity publish ─────┘                                          (Sanity webhook → CF Deploy Hook)
```

- Cloudflare Pages project: `dalia-cordeiro-site` (account: `daliacordeiro.studio@outlook.com`).
- Build cmd: `pnpm install --frozen-lockfile && pnpm build:web`, output dir `web/dist`.
- Sanity webhook (Create/Update/Delete on `production`, drafts excluded) hits a CF Deploy Hook; CF rebuilds main.
- The previous `.github/workflows/deploy.yml` (wrangler-action) was removed in favor of the CF git integration.

### Manual deploy (fallback)

```bash
pnpm build:web
wrangler pages deploy web/dist --project-name dalia-cordeiro-site
```

### Holding page / "go live" toggle

The repo has a second long-lived branch, **`holding-page`**, which contains a minimal Astro site that renders the bilingual "Site em renovação / Site under renovation" placeholder at every previously-live path. Which branch is currently public is controlled by **one setting** in Cloudflare Pages:

> Workers & Pages → `dalia-cordeiro-site` → Settings → Builds & deployments → **Production branch**

- **`holding-page`** = placeholder is live (current state during development).
- **`main`** = real site is live.

DNS (`www` and apex CNAME → `dalia-cordeiro-site.pages.dev`) and the apex-redirect Rule do not change. While `holding-page` is the production branch, every push to `main` produces a **preview deployment** that nobody sees on the custom domain — useful while iterating, but a trap to remember.

**To put the site live** (when the artist signs off):

1. In Studio, confirm Site Settings has `heroHeadline`, `heroIntro`, and `heroArtwork` filled for both PT and EN. `heroIntro` no longer has a hardcoded fallback — if empty, the homepage renders without the intro paragraph.
2. Cloudflare → Pages → `dalia-cordeiro-site` → Settings → Builds & deployments → change **Production branch** to `main` → Save.
3. Deployments tab → find the latest `main` deployment → "..." → **Retry deployment** (promotes it to production). Alternatively push any trivial commit to `main`.
4. Verify with `curl -sI https://www.daliacordeiroart.com | head -5` — expect a normal `200`, no `cache-control: no-store`, no `x-robots-tag: noindex, nofollow`.

**To put the placeholder back up** (maintenance / emergency): change Production branch back to `holding-page` in the same setting. Do not delete `holding-page` from origin — it's the maintenance switch.

---

## Owner / Account Info

- **Shared owner email** (will be handed over to the artist): `daliacordeiro.studio@outlook.com`. Cloudflare, Sanity org, and Web3Forms all sit under this email.
- The artist receives the Outlook credentials and from there inherits Sanity access automatically.
- An older personal account (`andrew10rivers10@gmail.com`) is no longer used by this project.

---

## Email

- **Public address (inbound)**: `studio@daliacordeiroart.com` — advertised on the contact and terms pages, in the JSON-LD `VisualArtist.email`, and in `scripts/import-from-data.js` (`siteSettings.contactEmail`).
- **Delivery mechanism**: **Cloudflare Email Routing** on the `daliacordeiroart.com` zone (free, no forwarding limit).
  - Route: `studio@daliacordeiroart.com` → `daliacordeiro.studio@outlook.com`
  - Catch-all (recommended setup): `*@daliacordeiroart.com` → `daliacordeiro.studio@outlook.com` so legacy / cards-printed addresses don't bounce.
  - DNS records (3 MX `route{1,2,3}.mx.cloudflare.net.` + SPF TXT `v=spf1 include:_spf.mx.cloudflare.net ~all`) are managed automatically by Email Routing — do not edit by hand.
- **Inbound only by design**: replies leave the Outlook account and recipients see `daliacordeiro.studio@outlook.com`. Sending as `studio@daliacordeiroart.com` is **not a project requirement** — do not propose Google Workspace / M365 / SMTP-relay setups unless explicitly asked.
- **Verifying inbound delivery**:
  ```bash
  dig @1.1.1.1 +short daliacordeiroart.com MX   # 3 lines, route1/2/3.mx.cloudflare.net
  dig @1.1.1.1 +short daliacordeiroart.com TXT  # contains "v=spf1 include:_spf.mx.cloudflare.net ~all"
  ```
  Then send a test email from another account to `studio@daliacordeiroart.com` — should land in the Outlook inbox within seconds.
- **Web3Forms is independent**: the contact form on `/pt/contacto/` and `/en/contact/` POSTs to Web3Forms, which delivers to the same Outlook inbox via its own pipeline. Disabling Email Routing would not affect the form; disabling Web3Forms would not affect direct emails.

---

## Migration Script

```bash
node scripts/import-from-data.js
```

Reads artwork data and images from `prototype/`, uploads to Sanity, creates all documents. Idempotent — safe to re-run; patches existing docs instead of duplicating.

---

## Do NOT

- Do not add SSR or a server adapter — site must stay fully static.
- Do not use Tailwind or any CSS framework — design system is custom CSS.
- Do not inline the Sanity client in React islands — pass data as serialized props from Astro.
- Do not create artwork detail pages (`/galeria/[slug]`) — modal-only is the agreed product decision.
- Do not add the Tweaks panel from `prototype/` — it was for prototyping only.
- Do not load fonts from Google Fonts CDN — they are self-hosted.
- Do not hardcode hero text/intro/image — those live in `siteSettings` so the artist can edit them. Do not reintroduce a hardcoded fallback for `heroIntro`.
- Do not introduce document-level i18n in Sanity — the project uses field-level `{pt, en}` objects with PT fallback.
- Do not delete the `holding-page` branch from `origin` — it is the production "maintenance mode" switch (see Deploy → Holding page / "go live" toggle).

---

## Reference Docs

- `README.md` — public-facing project description, tech stack, deploy notes.
- `docs/WORKFLOW.md` — PT-language content and deploy workflow (for the artist / handover).
- `docs/manual-site-dalia-cordeiro.pdf` — printable manual for the artist.
- `GUIA-CLIENTE.md` — client-facing guide.

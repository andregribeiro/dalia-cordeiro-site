// Cloudflare Pages Function — middleware.
//
// Runs on every request to the Pages project. Its only job is to redirect
// the bare *.pages.dev production URL to the canonical custom domain.
// Everything else (custom domains, branch/preview URLs) falls through
// untouched.
//
// This exists because Cloudflare removed the dashboard toggle that
// disabled access to the project's *.pages.dev URL, and host-scoped
// rules in the static `_redirects` file are not honoured for that URL.

const PROJECT_PAGES_HOST = 'dalia-cordeiro-site.pages.dev';
const CANONICAL_ORIGIN = 'https://www.daliacordeiroart.com';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === PROJECT_PAGES_HOST) {
    return Response.redirect(
      `${CANONICAL_ORIGIN}${url.pathname}${url.search}`,
      301,
    );
  }

  return context.next();
}

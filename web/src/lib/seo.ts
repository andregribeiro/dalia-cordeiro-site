import type { Lang } from './i18n';

export const SITE_NAME = 'Dália Cordeiro';

/** Locale strings for og:locale */
export const OG_LOCALE: Record<Lang, string> = {
  pt: 'pt_PT',
  en: 'en_US',
};

/** Static facts about the artist used to generate JSON-LD. */
const ARTIST = {
  name: 'Dália Cordeiro',
  jobTitle: { pt: 'Pintora', en: 'Painter' },
  description: {
    pt: 'Pintora portuguesa, nascida em Barreiro em 1955. Trabalha entre óleo, pastel e técnica mista.',
    en: 'Portuguese painter, born in Barreiro in 1955. Working in oil, pastel and mixed media.',
  },
  birthPlace: 'Barreiro, Portugal',
  birthYear: 1955,
  workLocation: 'Porto, Portugal',
  sameAs: ['https://www.instagram.com/dalia_cordeiro_art/'],
  email: 'studio@daliacordeiroart.com',
};

/** Build a Person / VisualArtist JSON-LD block. */
export function personJsonLd(
  lang: Lang,
  siteUrl: string,
  imageUrl?: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtist',
    name: ARTIST.name,
    url: siteUrl,
    ...(imageUrl ? { image: imageUrl } : {}),
    jobTitle: ARTIST.jobTitle[lang],
    description: ARTIST.description[lang],
    birthPlace: { '@type': 'Place', name: ARTIST.birthPlace },
    workLocation: { '@type': 'Place', name: ARTIST.workLocation },
    email: `mailto:${ARTIST.email}`,
    sameAs: ARTIST.sameAs,
  };
}

/** Build a WebSite JSON-LD block. */
export function websiteJsonLd(
  lang: Lang,
  siteUrl: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: lang === 'pt' ? 'pt-PT' : 'en',
  };
}

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface LocalizedString {
  pt?: string;
  en?: string;
}

export interface LocalizedText {
  pt?: string;
  en?: string;
}

export interface Series {
  _id: string;
  title: string;
  medium?: LocalizedString;
  description?: LocalizedText;
}

export interface Artwork {
  _id: string;
  code: string;
  title?: string;
  image: SanityImageSource & { alt?: LocalizedString };
  additionalImages?: Array<SanityImageSource & { alt?: LocalizedString }>;
  year: number;
  medium: LocalizedString;
  dimensions: { cm: string; in: string };
  series?: Series;
  status: 'available' | 'sold' | 'reserved' | 'nfs';
  description: LocalizedText;
}

export interface AboutStat {
  _key: string;
  label: LocalizedString;
  value: LocalizedString;
}

export interface BibliographyEntry {
  _key: string;
  year: string;
  title: LocalizedString;
  description?: LocalizedText;
  url?: string;
}

export interface About {
  portrait: SanityImageSource;
  shortBio: LocalizedText;
  longBio: { pt?: any[]; en?: any[] };
  birthplace: string;
  birthYear: number;
  stats: AboutStat[];
  bibliography?: BibliographyEntry[];
}

export interface SiteEvent {
  title?: LocalizedString;
  date?: string;
  venue?: LocalizedString;
  link?: string;
}

export interface SiteSettings {
  siteName: string;
  heroHeadline: LocalizedString;
  heroIntro?: LocalizedText;
  heroArtwork: Artwork;
  contactEmail: string;
  instagramUrl: string;
  defaultSeoImage?: SanityImageSource;
  footerText: LocalizedString;
  upcomingEvent?: SiteEvent;
  recentPastEvent?: SiteEvent;
}

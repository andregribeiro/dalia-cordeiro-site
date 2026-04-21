import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export interface LocalizedString {
  pt?: string;
  en?: string;
}

export interface LocalizedText {
  pt?: string;
  en?: string;
}

export interface Artwork {
  _id: string;
  title: string;
  slug: { current: string };
  image: SanityImageSource & { alt?: LocalizedString };
  additionalImages?: Array<SanityImageSource & { alt?: LocalizedString }>;
  year: number;
  medium: LocalizedString;
  dimensions: { cm: string; in: string };
  series: string;
  status: 'available' | 'sold' | 'reserved' | 'nfs';
  description: LocalizedText;
  displayOrder: number;
}

export interface AboutStat {
  _key: string;
  label: LocalizedString;
  value: LocalizedString;
}

export interface SelectedShow {
  _key: string;
  year: string;
  title: LocalizedString;
}

export interface About {
  portrait: SanityImageSource;
  shortBio: LocalizedText;
  longBio: { pt?: any[]; en?: any[] };
  birthplace: string;
  birthYear: number;
  stats: AboutStat[];
  selectedShows: SelectedShow[];
}

export interface SiteSettings {
  siteName: string;
  heroHeadline: LocalizedString;
  heroArtwork: Artwork;
  tagline: LocalizedString;
  studioLocation: LocalizedString;
  contactEmail: string;
  instagramUrl: string;
  defaultSeoImage?: SanityImageSource;
  footerText: LocalizedString;
}

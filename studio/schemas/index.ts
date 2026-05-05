import { localizedString, localizedText, localizedRichText } from './objects/localizedString';
import { artwork } from './artwork';
import { series } from './series';
import { about } from './about';
import { siteSettings } from './siteSettings';

export const schemaTypes = [
  // Object types
  localizedString,
  localizedText,
  localizedRichText,
  // Document types
  series,
  artwork,
  about,
  siteSettings,
];

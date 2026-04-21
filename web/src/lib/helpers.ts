import type { Lang } from './i18n';
import type { LocalizedString, LocalizedText } from './types';

/** Resolve a localized field with PT fallback */
export function loc(field: LocalizedString | LocalizedText | undefined, lang: Lang): string {
  if (!field) return '';
  return field[lang] || field.pt || '';
}

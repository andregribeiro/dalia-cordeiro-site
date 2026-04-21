export type Lang = 'pt' | 'en';

export const defaultLang: Lang = 'pt';
export const languages: Lang[] = ['pt', 'en'];

export const routes = {
  pt: { home: '/pt/', about: '/pt/sobre', contact: '/pt/contacto' },
  en: { home: '/en/', about: '/en/about', contact: '/en/contact' },
} as const;

export const ui = {
  pt: {
    nav_works: 'Obras',
    nav_about: 'Sobre',
    nav_contact: 'Contacto',
    tagline: 'Pintora — Porto, Portugal',
    intro:
      'Um corpo de trabalho em óleo, pastel e técnica mista. Figuras, santas e bestas mansas que não param de se rearranjar.',
    view_works: 'Ver o conjunto de obras',
    all: 'Tudo',
    filter_series: 'Série',
    filter_status: 'Estado',
    status_available: 'Disponível',
    status_sold: 'Vendida',
    status_reserved: 'Reservada',
    status_nfs: 'Não à venda',
    medium: 'Técnica',
    dimensions: 'Dimensões',
    year: 'Ano',
    series: 'Série',
    availability: 'Disponibilidade',
    inquire: 'Pedir informação sobre esta obra',
    close: 'Fechar',
    about_title: 'Sobre',
    contact_title: 'Contacto',
    contact_sub: 'Para disponibilidade, preços, visitas ao atelier e encomendas.',
    name: 'O seu nome',
    email: 'O seu email',
    message: 'Mensagem',
    send: 'Enviar pedido',
    inquiry_for: 'Pedido para',
    sent: 'Obrigada — mensagem enviada.',
    footer_studio: 'Atelier — Porto, Portugal',
    footer_rights: '© 2026 Dália Cordeiro. Todas as obras © a artista.',
  },
  en: {
    nav_works: 'Works',
    nav_about: 'About',
    nav_contact: 'Contact',
    tagline: 'Painter — Porto, Portugal',
    intro:
      'A body of work in oil, pastel and mixed media. Figures, saints and soft beasts that keep rearranging themselves.',
    view_works: 'View the body of work',
    all: 'All',
    filter_series: 'Series',
    filter_status: 'Status',
    status_available: 'Available',
    status_sold: 'Sold',
    status_reserved: 'Reserved',
    status_nfs: 'Not for sale',
    medium: 'Medium',
    dimensions: 'Dimensions',
    year: 'Year',
    series: 'Series',
    availability: 'Availability',
    inquire: 'Inquire about this work',
    close: 'Close',
    about_title: 'About',
    contact_title: 'Inquire',
    contact_sub: 'For availability, prices, studio visits and commissions.',
    name: 'Your name',
    email: 'Your email',
    message: 'Message',
    send: 'Send inquiry',
    inquiry_for: 'Inquiry for',
    sent: 'Thank you — message sent.',
    footer_studio: 'Studio — Porto, Portugal',
    footer_rights: '© 2026 Dália Cordeiro. All works © the artist.',
  },
} as const;

/** Series translation dict (static — few fixed values) */
export const seriesNames: Record<string, Record<Lang, string>> = {
  Metamorphoses: { en: 'Metamorphoses', pt: 'Metamorfoses' },
  'Works on Paper': { en: 'Works on Paper', pt: 'Obras Sobre Papel' },
  'Saints & Weeds': { en: 'Saints & Weeds', pt: 'Santas e Ervas' },
  Portraits: { en: 'Portraits', pt: 'Retratos' },
  Bestiary: { en: 'Bestiary', pt: 'Bestiário' },
};

type UiKey = keyof typeof ui.pt;

export function t(lang: Lang, key: UiKey): string {
  return ui[lang][key] ?? ui.pt[key] ?? key;
}

export function getLangFromUrl(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  if (seg === 'en') return 'en';
  return 'pt';
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === 'pt' ? 'en' : 'pt';
}

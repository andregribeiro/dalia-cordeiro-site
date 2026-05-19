import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Definições do Site',
  type: 'document',
  groups: [
    { name: 'home', title: 'Página inicial', default: true },
    { name: 'contact', title: 'Contacto e redes' },
    { name: 'events', title: 'Eventos' },
    { name: 'general', title: 'Geral' },
  ],
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Frase principal (hero)',
      description: 'A frase grande que aparece na homepage',
      type: 'localizedString',
      group: 'home',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Parágrafo de introdução (hero)',
      description: 'Parágrafo curto sob a frase principal. Descreve a prática/obra de forma poética. Independente de qualquer obra específica.',
      type: 'localizedText',
      group: 'home',
    }),
    defineField({
      name: 'heroImage',
      title: 'Imagem em destaque (hero)',
      description: 'Imagem que aparece em destaque na homepage. Pode ser uma obra, um detalhe do atelier, ou qualquer outra imagem — independente das obras publicadas.',
      type: 'image',
      options: { hotspot: true },
      group: 'home',
      fields: [
        {
          name: 'alt',
          title: 'Texto alternativo',
          description: 'Descrição curta da imagem para leitores de ecrã e SEO.',
          type: 'localizedString',
        },
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email de contacto',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      group: 'contact',
    }),
    defineField({
      name: 'upcomingEvent',
      title: 'Próximo evento',
      description: 'Aviso discreto no topo do site sobre uma exposição/evento futuro. Deixar vazio para não mostrar.',
      type: 'object',
      group: 'events',
      fields: [
        { name: 'title', title: 'Título', type: 'localizedString' },
        { name: 'date', title: 'Data', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
        { name: 'venue', title: 'Local', type: 'localizedString' },
        { name: 'link', title: 'Link (opcional)', type: 'url' },
      ],
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: 'recentPastEvent',
      title: 'Evento passado recente',
      description: 'Aviso discreto no topo do site sobre uma exposição/evento recente. Deixar vazio para não mostrar.',
      type: 'object',
      group: 'events',
      fields: [
        { name: 'title', title: 'Título', type: 'localizedString' },
        { name: 'date', title: 'Data', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
        { name: 'venue', title: 'Local', type: 'localizedString' },
        { name: 'link', title: 'Link (opcional)', type: 'url' },
      ],
      options: { collapsible: true, collapsed: false },
    }),
    defineField({
      name: 'siteName',
      title: 'Nome do site',
      type: 'string',
      initialValue: 'Dália Cordeiro',
      group: 'general',
    }),
    defineField({
      name: 'footerText',
      title: 'Texto do rodapé',
      type: 'localizedString',
      group: 'general',
    }),
    defineField({
      name: 'defaultSeoImage',
      title: 'Imagem SEO padrão',
      description: 'Imagem usada quando se partilha o site nas redes sociais.',
      type: 'image',
      group: 'general',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Definições do Site' };
    },
  },
});

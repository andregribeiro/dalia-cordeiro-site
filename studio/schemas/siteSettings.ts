import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Definições do Site',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nome do site',
      type: 'string',
      initialValue: 'Dália Cordeiro',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Frase principal (hero)',
      description: 'A frase grande que aparece na homepage',
      type: 'localizedString',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Parágrafo de introdução (hero)',
      description: 'Parágrafo curto sob a frase principal. Descreve a prática/obra de forma poética. Independente de qualquer obra específica.',
      type: 'localizedText',
    }),
    defineField({
      name: 'heroArtwork',
      title: 'Obra destacada (hero)',
      description: 'A obra que aparece em destaque na homepage',
      type: 'reference',
      to: [{ type: 'artwork' }],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email de contacto',
      type: 'string',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'defaultSeoImage',
      title: 'Imagem SEO padrão',
      type: 'image',
    }),
    defineField({
      name: 'footerText',
      title: 'Texto do rodapé',
      type: 'localizedString',
    }),
    defineField({
      name: 'upcomingEvent',
      title: 'Próximo evento',
      description: 'Aviso discreto no topo do site sobre uma exposição/evento futuro. Deixar vazio para não mostrar.',
      type: 'object',
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
      fields: [
        { name: 'title', title: 'Título', type: 'localizedString' },
        { name: 'date', title: 'Data', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
        { name: 'venue', title: 'Local', type: 'localizedString' },
        { name: 'link', title: 'Link (opcional)', type: 'url' },
      ],
      options: { collapsible: true, collapsed: false },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Definições do Site' };
    },
  },
});

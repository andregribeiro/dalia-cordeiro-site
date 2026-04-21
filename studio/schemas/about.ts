import { defineType, defineField } from 'sanity';

export const about = defineType({
  name: 'about',
  title: 'Sobre',
  type: 'document',
  fields: [
    defineField({
      name: 'portrait',
      title: 'Retrato',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'shortBio',
      title: 'Biografia curta',
      type: 'localizedText',
    }),
    defineField({
      name: 'longBio',
      title: 'Biografia completa',
      type: 'localizedRichText',
    }),
    defineField({
      name: 'birthplace',
      title: 'Local de nascimento',
      type: 'string',
    }),
    defineField({
      name: 'birthYear',
      title: 'Ano de nascimento',
      type: 'number',
    }),
    defineField({
      name: 'stats',
      title: 'Estatísticas',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Rótulo', type: 'localizedString' },
            { name: 'value', title: 'Valor', type: 'localizedString' },
          ],
          preview: {
            select: { label: 'label.pt', value: 'value.pt' },
            prepare({ label, value }) {
              return { title: `${label}: ${value}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'selectedShows',
      title: 'Exposições selecionadas',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'year', title: 'Ano', type: 'string' },
            { name: 'title', title: 'Título', type: 'localizedString' },
          ],
          preview: {
            select: { year: 'year', title: 'title.pt' },
            prepare({ year, title }) {
              return { title: `${year} — ${title}` };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Sobre a artista' };
    },
  },
});

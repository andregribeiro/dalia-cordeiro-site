import { defineType, defineField } from 'sanity';

export const series = defineType({
  name: 'series',
  title: 'Série',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Chave (identificador)',
      description: 'Identificador curto, sem espaços (ex: metamorphoses). Usado internamente.',
      type: 'string',
      validation: (r) =>
        r.required().regex(/^[a-z0-9-]+$/, {
          name: 'lower-kebab',
          invert: false,
        }),
    }),
    defineField({
      name: 'title',
      title: 'Nome da série',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'medium',
      title: 'Técnica padrão',
      description: 'Técnica usada por defeito em todas as obras desta série. Pode ser substituída obra a obra se necessário.',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: 'Descrição da série',
      description: 'Texto descritivo da série, partilhado por todas as obras. Pode ser substituído obra a obra se necessário.',
      type: 'localizedText',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Ordem de exibição',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Ordem de exibição',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title.pt', key: 'key' },
    prepare({ title, key }) {
      return { title: title || key || 'Série sem nome', subtitle: key };
    },
  },
});

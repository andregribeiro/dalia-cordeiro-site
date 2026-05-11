import { defineType, defineField } from 'sanity';
import { orderRankField } from '@sanity/orderable-document-list';

export const series = defineType({
  name: 'series',
  title: 'Série',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nome da série',
      description: 'Nome único da série, igual em português e inglês (ex: Metamorfoses).',
      type: 'string',
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
    orderRankField({ type: 'series' }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title: title || 'Série sem nome' };
    },
  },
});

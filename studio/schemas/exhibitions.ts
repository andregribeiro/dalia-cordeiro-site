import { defineType, defineField } from 'sanity';

export const exhibitions = defineType({
  name: 'exhibitions',
  title: 'Exposições',
  type: 'document',
  fields: [
    defineField({
      name: 'solo',
      title: 'Exposições Individuais',
      description: 'Uma exposição por linha. O texto é igual em português e inglês (sem tradução).',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'list' as any },
    }),
    defineField({
      name: 'group',
      title: 'Exposições Coletivas',
      description: 'Uma exposição por linha. O texto é igual em português e inglês (sem tradução).',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'list' as any },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Exposições' };
    },
  },
});

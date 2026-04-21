import { defineType } from 'sanity';

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Texto localizado',
  type: 'object',
  fields: [
    { name: 'pt', title: 'Português', type: 'string' },
    { name: 'en', title: 'English', type: 'string' },
  ],
});

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Texto longo localizado',
  type: 'object',
  fields: [
    { name: 'pt', title: 'Português', type: 'text', options: { rows: 4 } as any },
    { name: 'en', title: 'English', type: 'text', options: { rows: 4 } as any },
  ],
});

export const localizedRichText = defineType({
  name: 'localizedRichText',
  title: 'Rich text localizado',
  type: 'object',
  fields: [
    {
      name: 'pt',
      title: 'Português',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'en',
      title: 'English',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
});

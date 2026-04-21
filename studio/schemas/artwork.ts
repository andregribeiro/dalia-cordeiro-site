import { defineType, defineField } from 'sanity';

export const artwork = defineType({
  name: 'artwork',
  title: 'Obra',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Imagem principal',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Texto alternativo',
          type: 'localizedString',
        },
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'additionalImages',
      title: 'Imagens adicionais',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Texto alternativo',
              type: 'localizedString',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'year',
      title: 'Ano',
      type: 'number',
      validation: (r) => r.required().min(1950).max(2100),
    }),
    defineField({
      name: 'medium',
      title: 'Técnica',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'dimensions',
      title: 'Dimensões',
      type: 'object',
      fields: [
        { name: 'cm', title: 'cm (ex: 150 × 120 cm)', type: 'string' },
        { name: 'in', title: 'in (ex: 59 × 47 in)', type: 'string' },
      ],
    }),
    defineField({
      name: 'series',
      title: 'Série',
      type: 'string',
      options: {
        list: [
          { title: 'Metamorfoses', value: 'Metamorphoses' },
          { title: 'Obras Sobre Papel', value: 'Works on Paper' },
          { title: 'Santas e Ervas', value: 'Saints & Weeds' },
          { title: 'Retratos', value: 'Portraits' },
          { title: 'Bestiário', value: 'Bestiary' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Disponível', value: 'available' },
          { title: 'Vendida', value: 'sold' },
          { title: 'Reservada', value: 'reserved' },
          { title: 'Não à venda', value: 'nfs' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
    }),
    defineField({
      name: 'description',
      title: 'Descrição',
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
    {
      title: 'Ano (recente)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', year: 'year', media: 'image', status: 'status' },
    prepare({ title, year, media, status }) {
      return {
        title: title || 'Sem título',
        subtitle: `${year ?? '—'} · ${status ?? ''}`,
        media,
      };
    },
  },
});

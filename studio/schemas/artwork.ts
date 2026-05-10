import { defineType, defineField } from 'sanity';

export const artwork = defineType({
  name: 'artwork',
  title: 'Obra',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Código (referência)',
      description: 'Identificador curto e único da obra (ex: M-001). Usado para referências em emails de clientes — as obras não têm nome.',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'series',
      title: 'Série',
      description: 'A série a que esta obra pertence. O nome, técnica e descrição da série são herdados a menos que sejam substituídos abaixo.',
      type: 'reference',
      to: [{ type: 'series' }],
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
      name: 'dimensions',
      title: 'Dimensões',
      type: 'object',
      fields: [
        { name: 'cm', title: 'cm (ex: 150 × 120 cm)', type: 'string' },
        { name: 'in', title: 'in (ex: 59 × 47 in)', type: 'string' },
      ],
    }),
    defineField({
      name: 'mediumOverride',
      title: 'Técnica (substitui a série)',
      description: 'Opcional. Só preencher se esta obra usa uma técnica diferente da série.',
      type: 'localizedString',
    }),
    defineField({
      name: 'descriptionOverride',
      title: 'Descrição (substitui a série)',
      description: 'Opcional. Só preencher se esta obra precisa de uma descrição própria, distinta da série.',
      type: 'localizedText',
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
    select: {
      code: 'code',
      year: 'year',
      media: 'image',
      status: 'status',
      seriesTitle: 'series.title',
    },
    prepare({ code, year, media, status, seriesTitle }) {
      return {
        title: code || 'Sem código',
        subtitle: `${seriesTitle ?? '—'} · ${year ?? '—'} · ${status ?? ''}`,
        media,
      };
    },
  },
});

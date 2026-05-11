import { defineType, defineField } from 'sanity';

export const artwork = defineType({
  name: 'artwork',
  title: 'Obra',
  type: 'document',
  fieldsets: [
    {
      name: 'overrides',
      title: 'Substituir informação herdada da série (opcional)',
      description: 'Só preencher se esta obra precisa de técnica ou descrição diferentes da série.',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'code',
      title: 'Código (referência)',
      description: 'Identificador curto e único da obra (ex: M-001). Aparece nos pedidos de contacto para identificar a obra.',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'series',
      title: 'Série',
      description: 'A série a que esta obra pertence. Pré-preenchida quando a obra é criada dentro de uma série.',
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
          description: 'Descrição curta da imagem para leitores de ecrã e SEO.',
          type: 'localizedString',
        },
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'additionalImages',
      title: 'Imagens adicionais',
      description: 'Vistas detalhadas, contextos do atelier, costas da obra, etc. Opcional.',
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
      name: 'mediumOverride',
      title: 'Técnica (substitui a série)',
      type: 'localizedString',
      fieldset: 'overrides',
    }),
    defineField({
      name: 'descriptionOverride',
      title: 'Descrição (substitui a série)',
      type: 'localizedText',
      fieldset: 'overrides',
    }),
  ],
  orderings: [
    {
      title: 'Ano (recente primeiro)',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Código (A → Z)',
      name: 'codeAsc',
      by: [{ field: 'code', direction: 'asc' }],
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

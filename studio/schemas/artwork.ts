import { defineType, defineField } from 'sanity';

export const artwork = defineType({
  name: 'artwork',
  title: 'Obra',
  type: 'document',
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
      description: 'Opcional. Deixar vazio para obras individuais (sem série). Pré-preenchida quando a obra é criada dentro de uma série.',
      type: 'reference',
      to: [{ type: 'series' }],
    }),
    defineField({
      name: 'title',
      title: 'Nome da obra',
      description: 'Opcional. Nome próprio desta obra (sem tradução). Para obras individuais aparece no site como título. Para obras dentro de uma série, se preenchido substitui o nome da série neste cartão; se vazio, usa o nome da série.',
      type: 'string',
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
      title: 'Técnica',
      description: 'Para obras individuais, é a técnica desta obra. Quando dentro de uma série, substitui a técnica padrão da série (deixar vazio para herdar).',
      type: 'localizedString',
    }),
    defineField({
      name: 'descriptionOverride',
      title: 'Descrição',
      description: 'Para obras individuais, é a descrição desta obra. Quando dentro de uma série, substitui a descrição da série (deixar vazio para herdar).',
      type: 'localizedText',
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
      title: 'title',
      year: 'year',
      media: 'image',
      status: 'status',
      seriesTitle: 'series.title',
    },
    prepare({ code, title, year, media, status, seriesTitle }) {
      const head = title ? `${code} · ${title}` : (code || 'Sem código');
      return {
        title: head,
        subtitle: `${seriesTitle ?? '—'} · ${year ?? '—'} · ${status ?? ''}`,
        media,
      };
    },
  },
});

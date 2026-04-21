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
      name: 'heroArtwork',
      title: 'Obra destacada (hero)',
      description: 'A obra que aparece em destaque na homepage',
      type: 'reference',
      to: [{ type: 'artwork' }],
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'localizedString',
    }),
    defineField({
      name: 'studioLocation',
      title: 'Localização do atelier',
      type: 'localizedString',
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
  ],
  preview: {
    prepare() {
      return { title: 'Definições do Site' };
    },
  },
});

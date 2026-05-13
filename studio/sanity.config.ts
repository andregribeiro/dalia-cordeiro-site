import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { languageFilter } from '@sanity/language-filter';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from './schemas';

const singletonTypes = new Set(['about', 'siteSettings']);

const singletonListItem = (S: any, typeName: string, title: string) =>
  S.listItem()
    .title(title)
    .id(typeName)
    .child(S.document().schemaType(typeName).documentId(typeName));

export default defineConfig({
  name: 'dalia-cordeiro',
  title: 'Dália Cordeiro',
  projectId: 'gwtbwm5k',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Conteúdo')
          .items([
            S.listItem()
              .title('Séries')
              .id('series-list')
              .child(
                S.documentTypeList('series')
                  .title('Séries')
                  .child((seriesId) =>
                    S.list()
                      .title('Série')
                      .items([
                        S.listItem()
                          .title('Editar esta série')
                          .id('edit-series')
                          .child(
                            S.document()
                              .schemaType('series')
                              .documentId(seriesId),
                          ),
                        S.listItem()
                          .title('Obras desta série')
                          .id('series-artworks')
                          .child(
                            S.documentTypeList('artwork')
                              .title('Obras desta série')
                              .filter('_type == "artwork" && references($seriesId)')
                              .params({ seriesId })
                              .defaultOrdering([
                                { field: 'year', direction: 'desc' },
                              ])
                              .initialValueTemplates([
                                S.initialValueTemplateItem('artwork-in-series', {
                                  seriesId,
                                }),
                              ]),
                          ),
                      ]),
                  ),
              ),
            S.listItem()
              .title('Obras individuais')
              .id('standalone-artworks')
              .child(
                S.documentTypeList('artwork')
                  .title('Obras individuais (sem série)')
                  .filter('_type == "artwork" && !defined(series)')
                  .defaultOrdering([{ field: 'year', direction: 'desc' }])
                  .initialValueTemplates([
                    S.initialValueTemplateItem('artwork-standalone'),
                  ]),
              ),
            S.divider(),
            orderableDocumentListDeskItem({
              type: 'series',
              title: 'Reordenar séries',
              id: 'reorder-series',
              S,
              context,
            }),
            S.divider(),
            singletonListItem(S, 'about', 'Sobre'),
            singletonListItem(S, 'siteSettings', 'Definições do Site'),
          ]),
    }),
    languageFilter({
      supportedLanguages: [
        { id: 'pt', title: 'Português' },
        { id: 'en', title: 'English' },
      ],
      defaultLanguages: ['pt'],
      documentTypes: ['artwork', 'about', 'siteSettings'],
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
      {
        id: 'artwork-in-series',
        title: 'Obra nesta série',
        schemaType: 'artwork',
        parameters: [{ name: 'seriesId', type: 'string' }],
        value: ({ seriesId }: { seriesId: string }) => ({
          series: { _type: 'reference', _ref: seriesId },
        }),
      },
      {
        id: 'artwork-standalone',
        title: 'Obra individual (sem série)',
        schemaType: 'artwork',
        value: {},
      },
    ],
  },
  document: {
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) =>
            action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : input,
  },
});

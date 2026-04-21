import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { languageFilter } from '@sanity/language-filter';
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
      structure: (S) =>
        S.list()
          .title('Conteúdo')
          .items([
            S.listItem()
              .title('Obras')
              .schemaType('artwork')
              .child(S.documentTypeList('artwork').title('Obras')),
            S.divider(),
            singletonListItem(S, 'about', 'Sobre'),
            singletonListItem(S, 'siteSettings', 'Definições do Site'),
          ]),
    }),
    visionTool(),
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
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
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

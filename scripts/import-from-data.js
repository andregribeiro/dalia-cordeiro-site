#!/usr/bin/env node
/**
 * Migration script: prototype/data.js → Sanity
 * Idempotent — safe to run multiple times.
 *
 * Usage: node scripts/import-from-data.js
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, basename } from 'path';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const PROTO = resolve(import.meta.dirname, '..', 'prototype');

// ── Artwork data (copied from prototype/data.js) ───────────────────────────
const ARTWORKS = [
  {
    id: 'devir',
    image: 'art/real-03.png',
    title: 'Devir',
    year: 2025,
    medium: { en: 'Oil and pastel on canvas', pt: 'Óleo e pastel sobre tela' },
    dimensions: { cm: '150 × 120 cm', in: '59 × 47 in' },
    series: 'Metamorphoses',
    status: 'available',
    description: {
      en: 'A body unfurling into its own mythologies — eye, hand, hare, vine. Devir is the verb of becoming; here it is painted as a crowd of fragments politely sharing a single skin.',
      pt: 'Um corpo a desdobrar-se nas suas próprias mitologias — olho, mão, lebre, vinha. Devir é o verbo do tornar-se; aqui pintado como uma multidão de fragmentos partilhando, com cortesia, uma só pele.',
    },
  },
  {
    id: 'mercado',
    image: 'art/real-01.png',
    title: 'Market Arithmetic',
    year: 2024,
    medium: { en: 'Mixed media on paper', pt: 'Técnica mista sobre papel' },
    dimensions: { cm: '70 × 50 cm', in: '28 × 20 in' },
    series: 'Works on Paper',
    status: 'available',
    description: {
      en: 'Numbers scribbled above a figure like prices above fruit. The body is the ledger, the ledger is the body.',
      pt: 'Números rabiscados sobre uma figura como preços sobre fruta. O corpo é o livro de contas, o livro é o corpo.',
    },
  },
  {
    id: 'azulada',
    image: 'art/real-02.png',
    title: 'Azulada',
    year: 2025,
    medium: { en: 'Acrylic and oil stick on canvas', pt: 'Acrílico e pastel de óleo sobre tela' },
    dimensions: { cm: '180 × 90 cm', in: '71 × 35 in' },
    series: 'Saints & Weeds',
    status: 'available',
    description: {
      en: 'A saint painted onto an unstretched sheet, still smelling of the street she came from. Green eyes, red mouth, numbers on her sleeve.',
      pt: 'Uma santa pintada sobre uma folha por esticar, ainda a cheirar à rua de onde veio. Olhos verdes, boca vermelha, números na manga.',
    },
  },
  {
    id: 'veias',
    image: 'art/real-04.png',
    title: 'Veins',
    year: 2024,
    medium: { en: 'Oil on canvas', pt: 'Óleo sobre tela' },
    dimensions: { cm: '60 × 50 cm', in: '24 × 20 in' },
    series: 'Portraits',
    status: 'available',
    description: {
      en: 'A pink face being quietly overgrown by its own branches. A portrait held together by roots.',
      pt: 'Um rosto rosa a ser silenciosamente tomado pelos seus próprios ramos. Um retrato sustido por raízes.',
    },
  },
  {
    id: 'beijo-noturno',
    image: 'art/real-05.png',
    title: 'Nocturnal Kiss',
    year: 2024,
    medium: { en: 'Acrylic and pastel on canvas', pt: 'Acrílico e pastel sobre tela' },
    dimensions: { cm: '120 × 120 cm', in: '47 × 47 in' },
    series: 'Bestiary',
    status: 'reserved',
    description: {
      en: 'Two beasts on a yellow couch in the middle of the night. Flowers in the hair, teeth everywhere. A wedding and a warning.',
      pt: 'Duas bestas num sofá amarelo a meio da noite. Flores no cabelo, dentes em todo o lado. Um casamento e um aviso.',
    },
  },
  {
    id: 'rainha-do-jardim',
    image: 'art/real-06.png',
    title: 'Queen of the Garden',
    year: 2024,
    medium: { en: 'Oil on canvas', pt: 'Óleo sobre tela' },
    dimensions: { cm: '130 × 110 cm', in: '51 × 43 in' },
    series: 'Saints & Weeds',
    status: 'available',
    description: {
      en: 'A tall woman in a yellow dress presides over a garden of hearts, hands and pomegranates. A smaller watcher at her side.',
      pt: 'Uma mulher alta de vestido amarelo preside a um jardim de corações, mãos e romãs. Uma observadora menor ao seu lado.',
    },
  },
  {
    id: 'camara-verde',
    image: 'art/real-07.png',
    title: 'Green Chamber',
    year: 2025,
    medium: { en: 'Oil on canvas', pt: 'Óleo sobre tela' },
    dimensions: { cm: '140 × 140 cm', in: '55 × 55 in' },
    series: 'Metamorphoses',
    status: 'available',
    description: {
      en: 'Organs as geography. The body as a country with its own weather — a bird surfaces near the top, a hand rests near the edge.',
      pt: 'Órgãos como geografia. O corpo como um país com o seu próprio tempo — um pássaro aflora no topo, uma mão repousa na margem.',
    },
  },
  {
    id: 'raiz-quadrada',
    image: 'art/real-08.png',
    title: 'Square Root of Fourteen',
    year: 2024,
    medium: { en: 'Oil and pastel on canvas', pt: 'Óleo e pastel sobre tela' },
    dimensions: { cm: '110 × 90 cm', in: '43 × 35 in' },
    series: 'Portraits',
    status: 'available',
    description: {
      en: 'A face gridded like an equation. Yellow eyes solve nothing. The hand on the left is already reaching for another page.',
      pt: 'Um rosto quadriculado como uma equação. Olhos amarelos não resolvem nada. A mão à esquerda já procura a página seguinte.',
    },
  },
  {
    id: 'cem',
    image: 'art/real-09.png',
    title: 'One Hundred',
    year: 2023,
    medium: { en: 'Acrylic on canvas', pt: 'Acrílico sobre tela' },
    dimensions: { cm: '160 × 130 cm', in: '63 × 51 in' },
    series: 'Bestiary',
    status: 'sold',
    description: {
      en: 'A red giantess lifts a dumbbell labelled 100. A small green figure stands on her shoulder as if she were a hill.',
      pt: 'Uma giganta vermelha levanta um haltere marcado 100. Uma pequena figura verde põe-se-lhe ao ombro como se ela fosse uma colina.',
    },
  },
  {
    id: 'devir-estudo',
    image: 'art/real-10.png',
    title: 'Devir (study)',
    year: 2025,
    medium: { en: 'Oil on paper', pt: 'Óleo sobre papel' },
    dimensions: { cm: '70 × 50 cm', in: '28 × 20 in' },
    series: 'Works on Paper',
    status: 'available',
    description: {
      en: 'An earlier study for Devir. Softer, looser — the painting before it decided what it was.',
      pt: 'Um estudo anterior para Devir. Mais macio, mais solto — a pintura antes de decidir o que era.',
    },
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

async function uploadImage(filePath, filename) {
  const buffer = readFileSync(filePath);
  const asset = await client.assets.upload('image', buffer, { filename });
  console.log(`  ✓ Uploaded ${filename} → ${asset._id}`);
  return asset._id;
}

async function createOrPatch(doc) {
  const existing = await client.getDocument(doc._id);
  if (existing) {
    await client.patch(doc._id).set(doc).commit();
    console.log(`  ↻ Patched ${doc._id}`);
  } else {
    await client.create(doc);
    console.log(`  + Created ${doc._id}`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting migration…\n');

  // 1. Upload images and create artworks
  console.log('── Artworks ──');
  const firstArtworkId = `artwork-${ARTWORKS[0].id}`;

  for (let i = 0; i < ARTWORKS.length; i++) {
    const aw = ARTWORKS[i];
    const docId = `artwork-${aw.id}`;
    console.log(`\n[${i + 1}/${ARTWORKS.length}] ${aw.title}`);

    const imagePath = resolve(PROTO, aw.image);
    const assetId = await uploadImage(imagePath, basename(aw.image));

    await createOrPatch({
      _id: docId,
      _type: 'artwork',
      title: aw.title,
      slug: { _type: 'slug', current: aw.id },
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: assetId },
      },
      year: aw.year,
      medium: { _type: 'localizedString', pt: aw.medium.pt, en: aw.medium.en },
      dimensions: { cm: aw.dimensions.cm, in: aw.dimensions.in },
      series: aw.series,
      status: aw.status,
      description: { _type: 'localizedText', pt: aw.description.pt, en: aw.description.en },
      displayOrder: i,
    });
  }

  // 2. Upload portrait and create About singleton
  console.log('\n── About ──');
  const portraitPath = resolve(PROTO, 'art/portrait.png');
  const portraitAssetId = await uploadImage(portraitPath, 'portrait.png');

  await createOrPatch({
    _id: 'about',
    _type: 'about',
    portrait: {
      _type: 'image',
      asset: { _type: 'reference', _ref: portraitAssetId },
    },
    shortBio: {
      _type: 'localizedText',
      pt: 'Dália Cordeiro pinta corpos que se recusam a ficar quietos. Trabalhando entre óleo, pastel e técnica mista, constrói superfícies que ficam algures entre um jardim, um bestiário e uma discussão.',
      en: 'Dália Cordeiro paints bodies that refuse to stay put. Working between oil, pastel and mixed media, she builds surfaces that sit somewhere between a garden, a bestiary and an argument.',
    },
    longBio: {
      _type: 'localizedRichText',
      pt: [
        { _type: 'block', _key: 'pt1', style: 'normal', children: [{ _type: 'span', _key: 'pt1s', text: 'Dália Cordeiro nasceu no Barreiro em 1955. Formou-se em Educação Visual e Tecnológica pelo Instituto Piaget em Almada e lecionou artes visuais durante mais de trinta e cinco anos na escola pública portuguesa, em particular na Escola Álvaro Velho no Barreiro.' }], markDefs: [] },
        { _type: 'block', _key: 'pt2', style: 'normal', children: [{ _type: 'span', _key: 'pt2s', text: 'Nos últimos anos tem-se dedicado por inteiro à produção artística. Desde 2012 expõe regularmente em mostras coletivas e individuais, mas foi sobretudo desde 2021 que a sua obra ganhou uma maior projeção pública — através de icónicos salões de arte moderna e contemporânea, bem como de bienais e feiras de arte.' }], markDefs: [] },
        { _type: 'block', _key: 'pt3', style: 'normal', children: [{ _type: 'span', _key: 'pt3s', text: "Para além da sua participação na IV Bienal de Génova, as suas consecutivas participações no Salon d'Automne de Paris e na Art Capital Paris — históricos salões constituídos por um júri crítico — são reflexos da pertinência de um trabalho que oscila entre representações surrealistas e expressionistas." }], markDefs: [] },
        { _type: 'block', _key: 'pt4', style: 'normal', children: [{ _type: 'span', _key: 'pt4s', text: 'Em 2025, para além de ter sido selecionada para estes dois eventos da capital francesa, a sua obra foi exposta individualmente em Évora — na Biblioteca Pública de Évora (fundada em 1805) e na Galeria do Palácio do Barrocal, histórico edifício integrado na Fundação Inatel. Nesse mesmo ano foi selecionada para a Bienal Internacional de Gaia com a obra "Alienação", uma pintura crítica à progressiva fusão entre a humanidade e a máquina.' }], markDefs: [] },
      ],
      en: [
        { _type: 'block', _key: 'en1', style: 'normal', children: [{ _type: 'span', _key: 'en1s', text: 'Dália Cordeiro was born in Barreiro in 1955. She trained in Visual and Technological Education at Instituto Piaget, Almada, and taught visual arts for more than thirty-five years in the Portuguese public school system, in particular at Escola Álvaro Velho in Barreiro.' }], markDefs: [] },
        { _type: 'block', _key: 'en2', style: 'normal', children: [{ _type: 'span', _key: 'en2s', text: 'In recent years she has devoted herself entirely to her practice. Since 2012 she has exhibited regularly in group and solo shows, but it is above all since 2021 that her work has gained wider public reach — through iconic salons of modern and contemporary art, biennials and art fairs.' }], markDefs: [] },
        { _type: 'block', _key: 'en3', style: 'normal', children: [{ _type: 'span', _key: 'en3s', text: "Alongside her participation in the IV Biennial of Genoa, her consecutive selections for the Salon d'Automne de Paris and Art Capital Paris — historic juried salons — reflect the relevance of a body of work that oscillates between surrealist and expressionist registers." }], markDefs: [] },
        { _type: 'block', _key: 'en4', style: 'normal', children: [{ _type: 'span', _key: 'en4s', text: 'In 2025, besides being selected again for both Parisian events, she presented solo exhibitions in Évora — at the Biblioteca Pública de Évora (founded in 1805) and at Galeria do Palácio do Barrocal, a historic building of the Fundação Inatel. That same year she was selected for the International Biennial of Gaia with the painting "Alienação", a critical reflection on the progressive fusion of the human and the machine.' }], markDefs: [] },
      ],
    },
    birthplace: 'Barreiro',
    birthYear: 1955,
    stats: [
      {
        _type: 'object',
        _key: 's1',
        label: { _type: 'localizedString', pt: 'Nascida em', en: 'Born' },
        value: { _type: 'localizedString', pt: 'Barreiro, 1955', en: 'Barreiro, 1955' },
      },
      {
        _type: 'object',
        _key: 's2',
        label: { _type: 'localizedString', pt: 'Trabalha com', en: 'Working in' },
        value: { _type: 'localizedString', pt: 'Óleo · Pastel · Mista', en: 'Oil · Pastel · Mixed' },
      },
      {
        _type: 'object',
        _key: 's3',
        label: { _type: 'localizedString', pt: 'Expõe desde', en: 'Exhibiting since' },
        value: { _type: 'localizedString', pt: '2012 · PT · FR · IT', en: '2012 · PT · FR · IT' },
      },
    ],
    selectedShows: [
      { _type: 'object', _key: 'sh1', year: '2025', title: { _type: 'localizedString', pt: 'Bienal Internacional de Gaia — "Alienação"', en: 'International Biennial of Gaia — "Alienação"' } },
      { _type: 'object', _key: 'sh2', year: '2025', title: { _type: 'localizedString', pt: 'Individual · Biblioteca Pública de Évora', en: 'Solo show · Biblioteca Pública de Évora' } },
      { _type: 'object', _key: 'sh3', year: '2025', title: { _type: 'localizedString', pt: 'Individual · Galeria do Palácio do Barrocal, Fundação Inatel', en: 'Solo show · Galeria do Palácio do Barrocal, Fundação Inatel' } },
      { _type: 'object', _key: 'sh4', year: '2025', title: { _type: 'localizedString', pt: "Salon d'Automne · Art Capital, Paris", en: "Salon d'Automne · Art Capital, Paris" } },
      { _type: 'object', _key: 'sh5', year: '—', title: { _type: 'localizedString', pt: 'IV Bienal de Génova', en: 'IV Biennial of Genoa' } },
    ],
  });

  // 3. Create siteSettings singleton
  console.log('\n── Site Settings ──');
  await createOrPatch({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Dália Cordeiro',
    heroHeadline: {
      _type: 'localizedString',
      pt: 'Corpos que se recusam a ficar quietos.',
      en: 'Bodies that refuse to stay put.',
    },
    heroArtwork: { _type: 'reference', _ref: firstArtworkId },
    tagline: {
      _type: 'localizedString',
      pt: 'Pintora — Porto, Portugal',
      en: 'Painter — Porto, Portugal',
    },
    studioLocation: {
      _type: 'localizedString',
      pt: 'Atelier — Porto, Portugal',
      en: 'Studio — Porto, Portugal',
    },
    contactEmail: 'studio@daliacordeiro.art',
    instagramUrl: 'https://www.instagram.com/dalia_cordeiro_art/',
    footerText: {
      _type: 'localizedString',
      pt: '© 2026 Dália Cordeiro. Todas as obras © a artista.',
      en: '© 2026 Dália Cordeiro. All works © the artist.',
    },
  });

  console.log('\n✓ Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

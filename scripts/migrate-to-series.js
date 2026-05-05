#!/usr/bin/env node
/**
 * Migration: convert artworks from string-series + title to
 * series-document references + code identifier.
 *
 * Idempotent — safe to re-run. Already-migrated artworks are skipped.
 *
 * Steps:
 *   1) Ensure 5 series documents exist (one per known series key).
 *   2) For each artwork still using the old string-series format:
 *      - assign a code (e.g. M-001, W-002) based on its series
 *      - replace `series` (string) with a reference to the series doc
 *      - move existing `medium` → `mediumOverride`,
 *        `description` → `descriptionOverride`
 *      - unset legacy fields: title, slug, medium, description
 *   3) Strip orphan `selectedShows` from the About doc (schema removed).
 *
 * Usage: node scripts/migrate-to-series.js
 *   Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN in env.
 */

import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Maps old enum string → new series doc + code prefix.
const SERIES = [
  { key: 'metamorphoses',  titlePt: 'Metamorfoses',     titleEn: 'Metamorphoses',  oldString: 'Metamorphoses',  prefix: 'M', order: 0 },
  { key: 'works-on-paper', titlePt: 'Obras Sobre Papel', titleEn: 'Works on Paper', oldString: 'Works on Paper', prefix: 'W', order: 1 },
  { key: 'saints-weeds',   titlePt: 'Santas e Ervas',   titleEn: 'Saints & Weeds', oldString: 'Saints & Weeds', prefix: 'S', order: 2 },
  { key: 'portraits',      titlePt: 'Retratos',          titleEn: 'Portraits',      oldString: 'Portraits',      prefix: 'P', order: 3 },
  { key: 'bestiary',       titlePt: 'Bestiário',         titleEn: 'Bestiary',       oldString: 'Bestiary',       prefix: 'B', order: 4 },
];

const byOldString = Object.fromEntries(SERIES.map((s) => [s.oldString, s]));

async function ensureSeriesDocs() {
  console.log('── Ensuring series documents ──');
  for (const s of SERIES) {
    const docId = `series-${s.key}`;
    const existing = await client.getDocument(docId);
    if (existing) {
      // Don't overwrite medium/description (artist may have edited them).
      // Just make sure key/title/displayOrder are set if missing.
      await client.patch(docId)
        .setIfMissing({
          key: s.key,
          title: { _type: 'localizedString', pt: s.titlePt, en: s.titleEn },
          displayOrder: s.order,
        })
        .commit();
      console.log(`  ↻ series-${s.key} (kept existing)`);
    } else {
      await client.create({
        _id: docId,
        _type: 'series',
        key: s.key,
        title: { _type: 'localizedString', pt: s.titlePt, en: s.titleEn },
        displayOrder: s.order,
      });
      console.log(`  + series-${s.key}`);
    }
  }
}

async function migrateArtworks() {
  console.log('\n── Migrating artworks ──');
  const artworks = await client.fetch(
    `*[_type == "artwork"] | order(displayOrder asc) {
      _id, title, series, medium, description, displayOrder
    }`,
  );

  const counters = Object.fromEntries(SERIES.map((s) => [s.key, 0]));

  // Stable order: by old series string, then displayOrder.
  artworks.sort((a, b) => {
    const sa = typeof a.series === 'string' ? a.series : '';
    const sb = typeof b.series === 'string' ? b.series : '';
    if (sa !== sb) return sa.localeCompare(sb);
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });

  for (const aw of artworks) {
    if (typeof aw.series !== 'string') {
      console.log(`  ⏭  ${aw._id} (already migrated)`);
      continue;
    }
    const info = byOldString[aw.series];
    if (!info) {
      console.log(`  ⚠  ${aw._id} has unknown series "${aw.series}" — skipped`);
      continue;
    }

    counters[info.key] += 1;
    const code = `${info.prefix}-${String(counters[info.key]).padStart(3, '0')}`;

    const set = {
      code,
      series: { _type: 'reference', _ref: `series-${info.key}` },
    };
    if (aw.medium) set.mediumOverride = aw.medium;
    if (aw.description) set.descriptionOverride = aw.description;

    await client.patch(aw._id)
      .set(set)
      .unset(['title', 'slug', 'medium', 'description'])
      .commit();

    console.log(`  ✓ ${aw._id} → ${code} (${info.titleEn})`);
  }
}

async function cleanupAbout() {
  console.log('\n── Cleaning up About ──');
  try {
    await client.patch('about').unset(['selectedShows']).commit();
    console.log('  ✓ Removed orphan selectedShows from about');
  } catch (e) {
    console.log(`  (about: ${e.message})`);
  }
}

async function main() {
  console.log('Migration: artworks → series-based\n');
  await ensureSeriesDocs();
  await migrateArtworks();
  await cleanupAbout();
  console.log('\n✓ Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

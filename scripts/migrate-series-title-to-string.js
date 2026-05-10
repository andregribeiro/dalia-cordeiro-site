#!/usr/bin/env node
/**
 * Migration: flatten series.title from { pt, en } object to plain string.
 *
 * Reason: a série has a single, language-neutral name. Keeping it as a
 * localizedString forced the artist to fill two tabs with the same value.
 *
 * Idempotent — already-flat documents are skipped.
 *
 * Usage: node scripts/migrate-series-title-to-string.js
 *   Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN in env.
 *
 * Run this BEFORE deploying the new Studio schema (series.title: string).
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

async function main() {
  console.log('Migration: series.title → plain string\n');

  const series = await client.fetch(`*[_type == "series"]{ _id, key, title }`);

  for (const s of series) {
    if (typeof s.title === 'string') {
      console.log(`  ⏭  ${s._id} (already a string: "${s.title}")`);
      continue;
    }
    const flat = s.title?.pt || s.title?.en || s.key;
    if (!flat) {
      console.log(`  ⚠  ${s._id} has no usable title — skipped`);
      continue;
    }
    await client.patch(s._id).set({ title: flat }).commit();
    console.log(`  ✓ ${s._id} → "${flat}"`);
  }

  console.log('\n✓ Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

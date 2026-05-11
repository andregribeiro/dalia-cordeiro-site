#!/usr/bin/env node
/**
 * Migration: seed orderRank on series, drop legacy `key` and `displayOrder`.
 *
 * - Series: assign `orderRank` from existing `displayOrder` (so the current
 *   curated order is preserved when @sanity/orderable-document-list takes over),
 *   then unset `key` and `displayOrder`.
 * - Artworks: unset `displayOrder` (we now sort by series-rank + year).
 *
 * Idempotent — re-running is safe.
 *
 * Run BEFORE deploying the new Studio schema.
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

// Zero-padded sortable rank string, with gaps for future inserts.
function rankFor(index) {
  return String((index + 1) * 1000).padStart(8, '0');
}

async function migrateSeries() {
  console.log('── Series: seed orderRank, drop key/displayOrder ──');
  const series = await client.fetch(
    `*[_type == "series"] | order(coalesce(displayOrder, 999) asc, _createdAt asc) {
      _id, displayOrder, orderRank, key
    }`,
  );

  for (let i = 0; i < series.length; i++) {
    const s = series[i];
    const patch = client.patch(s._id);
    let touched = false;

    if (!s.orderRank) {
      patch.set({ orderRank: rankFor(i) });
      touched = true;
    }
    if (s.key !== undefined || s.displayOrder !== undefined) {
      patch.unset(['key', 'displayOrder']);
      touched = true;
    }

    if (!touched) {
      console.log(`  ⏭  ${s._id} (already clean)`);
      continue;
    }
    await patch.commit();
    console.log(`  ✓ ${s._id} → orderRank=${s.orderRank ?? rankFor(i)}`);
  }
}

async function migrateArtworks() {
  console.log('\n── Artworks: drop displayOrder ──');
  const aws = await client.fetch(
    `*[_type == "artwork" && defined(displayOrder)]{ _id }`,
  );
  for (const a of aws) {
    await client.patch(a._id).unset(['displayOrder']).commit();
    console.log(`  ✓ ${a._id}`);
  }
  if (!aws.length) console.log('  ⏭  nothing to clean');
}

async function main() {
  console.log('Migration: orderRank + legacy cleanup\n');
  await migrateSeries();
  await migrateArtworks();
  console.log('\n✓ Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

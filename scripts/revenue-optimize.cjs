#!/usr/bin/env node

/**
 * Revenue Optimization Template Inserter (GSC/GA4 driven)
 *
 * - Selects top N posts by opportunity:
 *   - GSC: high impressions + low CTR
 *   - GA4: has sessions but short duration
 * - Inserts/updates 3 template blocks in Sanity body, only within:
 *   <!-- revenue-opt:start --> ... <!-- revenue-opt:end -->
 * - Prevents double insertion (idempotent)
 *
 * Usage:
 *   node scripts/revenue-optimize.cjs --limit 10 --days 7 --apply
 *   node scripts/revenue-optimize.cjs --limit 10 --days 7           # dry-run
 *
 * Required env:
 *   SANITY_API_TOKEN=...
 *   GOOGLE_SERVICE_ACCOUNT_JSON=... (service account JSON string)
 *   GA4_PROPERTY_ID=...
 *   GSC_SITE_URL=https://sasakiyoshimasa.com/
 *
 * Optional env:
 *   REVENUE_OPT_TARGET_CTR=0.03
 *   REVENUE_OPT_TARGET_DURATION_SEC=45
 *   REVENUE_OPT_WEIGHT_GSC=1
 *   REVENUE_OPT_WEIGHT_GA4=1
 *   REVENUE_OPT_PROGRESS_FILE=analytics/revenue-optimize-last-run.json
 */

const { createClient } = require('@sanity/client');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SANITY_PROJECT_ID = 'aoxze287';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

function parseArgs(argv) {
  const args = {
    limit: 10,
    days: 7,
    apply: false,
    dryRun: true,
  };

  for (let i = 2; i < argv.length; i++) {
    const value = argv[i];
    if (value === '--limit') {
      args.limit = Number(argv[i + 1]);
      i++;
      continue;
    }
    if (value === '--days') {
      args.days = Number(argv[i + 1]);
      i++;
      continue;
    }
    if (value === '--apply') {
      args.apply = true;
      args.dryRun = false;
      continue;
    }
    if (value === '--dry-run') {
      args.apply = false;
      args.dryRun = true;
      continue;
    }
  }

  if (!Number.isFinite(args.limit) || args.limit <= 0) args.limit = 10;
  if (!Number.isFinite(args.days) || args.days <= 0) args.days = 7;

  return args;
}

function clampNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toDateStringUtc(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function randomKey() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

function buildAuthFromEnv() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required');

  let credentials;
  try {
    credentials = JSON.parse(json);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON');
  }

  const scopes = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ];

  return new google.auth.GoogleAuth({ credentials, scopes });
}

function slugFromPath(pathname = '') {
  const match = pathname.match(/^\/blog\/([^/?#]+)$/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function slugFromGscPageUrl(url = '') {
  try {
    const u = new URL(url);
    return slugFromPath(u.pathname);
  } catch {
    return null;
  }
}

async function fetchGscPageMetrics({ auth, siteUrl, startDate, endDate, rowLimit = 1000 }) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit,
      dataState: 'final',
    },
  });

  const rows = res.data.rows || [];
  return rows.map((row) => ({
    page: row.keys?.[0] || '',
    clicks: Number(row.clicks || 0),
    impressions: Number(row.impressions || 0),
    ctr: Number(row.ctr || 0),
    position: Number(row.position || 0),
  }));
}

async function fetchGa4PageMetrics({ auth, propertyId, startDate, endDate, limit = 1000 }) {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const res = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'averageSessionDuration' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    },
  });

  const rows = res.data.rows || [];
  return rows.map((row) => ({
    pagePath: row.dimensionValues?.[0]?.value || '',
    sessions: Number(row.metricValues?.[0]?.value || 0),
    avgSessionDuration: Number(row.metricValues?.[1]?.value || 0),
  }));
}

function computeGscScore({ impressions, ctr }, targetCtr) {
  if (!Number.isFinite(impressions) || impressions <= 0) return 0;
  const deficit = Math.max(0, targetCtr - (Number.isFinite(ctr) ? ctr : 0));
  const ratio = targetCtr > 0 ? deficit / targetCtr : 0;
  return impressions * ratio;
}

function computeGa4Score({ sessions, avgSessionDuration }, targetDurationSec) {
  if (!Number.isFinite(sessions) || sessions <= 0) return 0;
  const duration = Number.isFinite(avgSessionDuration) ? avgSessionDuration : 0;
  const deficit = Math.max(0, targetDurationSec - duration);
  const ratio = targetDurationSec > 0 ? deficit / targetDurationSec : 0;
  return sessions * ratio;
}

function revenueTemplateHtml({ position, slug }) {
  const START = '<!-- revenue-opt:start -->';
  const END = '<!-- revenue-opt:end -->';

  const ytUrl = process.env.REVENUE_OPT_YOUTUBE_URL || 'https://www.youtube.com/';
  const categoriesUrl = '/categories';
  const aboutUrl = '/about';

  const baseStyle =
    'border:1px solid #e5e7eb;background:#f8fafc;border-radius:12px;padding:14px 16px;line-height:1.7;';
  const titleStyle = 'font-weight:700;font-size:16px;margin:0 0 6px;color:#111827;';
  const textStyle = 'margin:0;color:#374151;font-size:14px;';
  const linkStyle = 'display:inline-block;margin-top:10px;color:#1d4ed8;text-decoration:underline;';
  const badgeStyle =
    'display:inline-block;font-size:11px;font-weight:700;color:#6b7280;background:#eef2ff;border-radius:999px;padding:2px 8px;margin-bottom:8px;';

  let title = '';
  let text = '';
  let linkHref = '';
  let linkText = '';

  if (position === 'intro') {
    title = 'まずは動画で雰囲気をチェック';
    text = '現地の空気感を先に掴むと、記事の見どころが探しやすくなります。';
    linkHref = ytUrl;
    linkText = 'YouTubeで見る';
  } else if (position === 'middle') {
    title = '他のエリアもまとめて探す';
    text = '気になる市町村・エリア別に、関連記事を一覧で見られます。';
    linkHref = categoriesUrl;
    linkText = '地域別カテゴリー一覧へ';
  } else {
    title = '次の行き先を探すヒント';
    text = '保存して、次のお出かけ計画に役立ててください。';
    linkHref = aboutUrl;
    linkText = 'サイトについてを見る';
  }

  return [
    START,
    `<div data-revenue-opt="true" data-revenue-opt-position="${position}" data-revenue-opt-slug="${slug}" style="${baseStyle}">`,
    `<div style="${badgeStyle}">おすすめ</div>`,
    `<div style="${titleStyle}">${title}</div>`,
    `<p style="${textStyle}">${text}</p>`,
    `<a href="${linkHref}" style="${linkStyle}">${linkText}</a>`,
    `</div>`,
    END,
  ].join('');
}

function detectRevenuePosition(html) {
  if (!html.includes('<!-- revenue-opt:start -->') || !html.includes('<!-- revenue-opt:end -->')) return null;
  const match = html.match(/data-revenue-opt-position="(intro|middle|end)"/);
  return match ? match[1] : 'unknown';
}

function upsertRevenueBlocks(body, slug) {
  const blocks = Array.isArray(body) ? body : [];

  const positions = { intro: null, middle: null, end: null };
  const revenueIndexes = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b?._type !== 'html' || typeof b.html !== 'string') continue;
    const pos = detectRevenuePosition(b.html);
    if (!pos) continue;
    revenueIndexes.push(i);
    if (pos === 'unknown') {
      return { changed: false, reason: 'unknown_marker_format', body: blocks };
    }
    if (positions[pos] != null) {
      return { changed: false, reason: `duplicate_${pos}`, body: blocks };
    }
    positions[pos] = i;
  }

  const next = blocks.slice();
  const changes = [];

  // update existing blocks first
  for (const pos of ['intro', 'middle', 'end']) {
    const idx = positions[pos];
    if (idx == null) continue;
    const existing = next[idx];
    const newHtml = revenueTemplateHtml({ position: pos, slug });
    if (existing.html !== newHtml) {
      next[idx] = { ...existing, html: newHtml };
      changes.push(`update:${pos}`);
    }
  }

  // insert missing blocks
  const insertBlock = (pos, atIndex) => {
    const block = { _type: 'html', _key: randomKey(), html: revenueTemplateHtml({ position: pos, slug }) };
    next.splice(atIndex, 0, block);
    changes.push(`insert:${pos}`);
  };

  // intro
  if (positions.intro == null) {
    let at = 0;
    for (let i = 0; i < next.length; i++) {
      const b = next[i];
      if (b?._type === 'block' && b.style === 'normal') {
        at = i + 1;
        break;
      }
    }
    insertBlock('intro', at);
  }

  // middle
  if (positions.middle == null) {
    const mid = Math.floor(next.length / 2);
    let at = mid;
    for (let i = mid; i < next.length; i++) {
      const b = next[i];
      if (b?._type === 'block' && (b.style === 'h2' || b.style === 'h3')) {
        at = i + 1;
        break;
      }
    }
    insertBlock('middle', at);
  }

  // end
  if (positions.end == null) {
    insertBlock('end', next.length);
  }

  return { changed: changes.length > 0, changes, body: next };
}

async function main() {
  const args = parseArgs(process.argv);

  const sanityToken = process.env.SANITY_API_TOKEN;
  if (!sanityToken) throw new Error('SANITY_API_TOKEN is required');
  const propertyId = process.env.GA4_PROPERTY_ID;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!propertyId) throw new Error('GA4_PROPERTY_ID is required');
  if (!siteUrl) throw new Error('GSC_SITE_URL is required');

  const targetCtr = clampNumber(process.env.REVENUE_OPT_TARGET_CTR, 0.03);
  const targetDurationSec = clampNumber(process.env.REVENUE_OPT_TARGET_DURATION_SEC, 45);
  const weightGsc = clampNumber(process.env.REVENUE_OPT_WEIGHT_GSC, 1);
  const weightGa4 = clampNumber(process.env.REVENUE_OPT_WEIGHT_GA4, 1);

  const auth = buildAuthFromEnv();

  const endUtc = new Date();
  const startUtc = new Date(Date.UTC(endUtc.getUTCFullYear(), endUtc.getUTCMonth(), endUtc.getUTCDate() - args.days));
  const startDate = toDateStringUtc(startUtc);
  const endDate = toDateStringUtc(new Date(Date.UTC(endUtc.getUTCFullYear(), endUtc.getUTCMonth(), endUtc.getUTCDate() - 1)));

  console.log('📈 Revenue optimize: fetching analytics...');
  console.log(`- Date range (UTC): ${startDate}..${endDate}`);
  console.log(`- Limit: ${args.limit}`);
  console.log(`- Apply: ${args.apply}`);

  const [gscRows, ga4Rows] = await Promise.all([
    fetchGscPageMetrics({ auth, siteUrl, startDate, endDate, rowLimit: 1000 }),
    fetchGa4PageMetrics({ auth, propertyId, startDate, endDate, limit: 1000 }),
  ]);

  const candidates = new Map();

  for (const row of gscRows) {
    const slug = slugFromGscPageUrl(row.page);
    if (!slug) continue;
    const score = computeGscScore(row, targetCtr) * weightGsc;
    if (!candidates.has(slug)) candidates.set(slug, { slug, gsc: null, ga4: null, score: 0 });
    const current = candidates.get(slug);
    current.gsc = row;
    current.score += score;
  }

  for (const row of ga4Rows) {
    const slug = slugFromPath(row.pagePath);
    if (!slug) continue;
    const score = computeGa4Score(row, targetDurationSec) * weightGa4;
    if (!candidates.has(slug)) candidates.set(slug, { slug, gsc: null, ga4: null, score: 0 });
    const current = candidates.get(slug);
    current.ga4 = row;
    current.score += score;
  }

  const ordered = [...candidates.values()]
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, args.limit);

  console.log(`🎯 Selected candidates: ${ordered.length}`);

  const sanityClient = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    useCdn: false,
    token: sanityToken,
  });

  const results = [];

  for (const candidate of ordered) {
    const slug = candidate.slug;
    const doc = await sanityClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]{ _id, title, "slug": slug.current, body }`,
      { slug }
    );

    if (!doc?._id || !Array.isArray(doc.body)) {
      console.warn(`⚠️ Skip (not found or body missing): ${slug}`);
      results.push({ slug, status: 'skip_not_found' });
      continue;
    }

    const { changed, reason, changes, body } = upsertRevenueBlocks(doc.body, slug);
    if (!changed) {
      results.push({ slug, status: 'skip', reason: reason || 'no_change' });
      continue;
    }

    if (!args.apply) {
      console.log(`📝 DRY RUN: ${slug} (${changes.join(', ')})`);
      results.push({ slug, status: 'dry_run', changes });
      continue;
    }

    await sanityClient.patch(doc._id).set({ body }).commit();
    console.log(`✅ Updated: ${slug} (${changes.join(', ')})`);
    results.push({ slug, status: 'updated', changes });
  }

  const progressFile = process.env.REVENUE_OPT_PROGRESS_FILE || path.join('analytics', 'revenue-optimize-last-run.json');
  const progressDir = path.dirname(progressFile);
  fs.mkdirSync(progressDir, { recursive: true });
  fs.writeFileSync(
    progressFile,
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        apply: args.apply,
        rangeUtc: { startDate, endDate },
        limit: args.limit,
        selected: ordered.map((c) => ({
          slug: c.slug,
          score: c.score,
          gsc: c.gsc
            ? { impressions: c.gsc.impressions, clicks: c.gsc.clicks, ctr: c.gsc.ctr, position: c.gsc.position }
            : null,
          ga4: c.ga4 ? { sessions: c.ga4.sessions, avgSessionDuration: c.ga4.avgSessionDuration } : null,
        })),
        results,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  console.log(`📄 Wrote progress: ${progressFile}`);
}

main().catch((error) => {
  console.error('❌ revenue-optimize failed:', error?.message || error);
  process.exit(1);
});


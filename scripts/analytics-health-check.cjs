#!/usr/bin/env node

/**
 * Analytics Health Check (GA4 + GSC)
 *
 * Detects:
 * - zero traffic
 * - sudden drops (vs previous day / recent average)
 * - auth failures
 *
 * If abnormal: creates a GitHub Issue and exits 0 (non-failing).
 * If normal: does nothing and exits 0.
 *
 * Env (recommended):
 *   GOOGLE_SERVICE_ACCOUNT_JSON=... (service account JSON string)
 *   GA4_PROPERTY_ID=123456789
 *   GSC_SITE_URL=https://sasakiyoshimasa.com/
 *   HEALTHCHECK_LOOKBACK_DAYS=7
 *   HEALTHCHECK_DROP_RATIO=0.2
 *   GITHUB_TOKEN=...
 *   GITHUB_REPOSITORY=owner/repo
 */

const { google } = require('googleapis');
const fs = require('fs');

function appendGithubOutput(key, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  fs.appendFileSync(outputPath, `${key}=${String(value)}\n`, 'utf8');
}

function toDateStringUtc(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clampNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function mean(values) {
  const filtered = values.filter((v) => Number.isFinite(v));
  if (filtered.length === 0) return 0;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

async function githubRequest(method, url, body) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is required to create issues');

  const response = await fetch(url, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
      'user-agent': 'toyamablog-analytics-health-check',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = json?.message || text || `HTTP ${response.status}`;
    throw new Error(`GitHub API error: ${message}`);
  }
  return json;
}

async function ensureIssue({ title, body, labels }) {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) throw new Error('GITHUB_REPOSITORY is required to create issues');
  const [owner, name] = repo.split('/');
  if (!owner || !name) throw new Error(`Invalid GITHUB_REPOSITORY: ${repo}`);

  const listUrl = `https://api.github.com/repos/${owner}/${name}/issues?state=open&per_page=100`;
  const issues = await githubRequest('GET', listUrl);
  const exists = issues.some((issue) => issue?.title === title);
  if (exists) return;

  const createUrl = `https://api.github.com/repos/${owner}/${name}/issues`;
  await githubRequest('POST', createUrl, { title, body, labels });
}

function buildAuthFromEnv() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is required');
  }

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

async function fetchGa4DailySessions({ auth, propertyId, startDate, endDate }) {
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const res = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'sessions' }],
      keepEmptyRows: true,
    },
  });

  const rows = res.data.rows || [];
  const byDate = new Map();
  for (const row of rows) {
    const date = row.dimensionValues?.[0]?.value;
    const sessions = Number(row.metricValues?.[0]?.value || 0);
    if (!date) continue;
    // GA4 date dimension comes as YYYYMMDD
    const formatted = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    byDate.set(formatted, sessions);
  }
  return byDate;
}

async function fetchGscDailyClicks({ auth, siteUrl, startDate, endDate }) {
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date'],
      rowLimit: 1000,
    },
  });

  const rows = res.data.rows || [];
  const byDate = new Map();
  for (const row of rows) {
    const date = row.keys?.[0];
    const clicks = Number(row.clicks || 0);
    if (!date) continue;
    byDate.set(date, clicks);
  }
  return byDate;
}

function evaluateSeries({ label, yesterday, dayBefore, recentAvg, dropRatio }) {
  const issues = [];

  if (yesterday === 0 && (dayBefore > 0 || recentAvg > 0)) {
    issues.push(`${label}: yesterday is 0 (dayBefore=${dayBefore}, recentAvg=${recentAvg.toFixed(2)})`);
  }

  if (dayBefore > 0) {
    const ratio = yesterday / dayBefore;
    if (ratio < dropRatio) {
      issues.push(`${label}: sudden drop vs dayBefore (yesterday=${yesterday}, dayBefore=${dayBefore}, ratio=${ratio.toFixed(2)})`);
    }
  }

  if (recentAvg > 0) {
    const ratio = yesterday / recentAvg;
    if (ratio < dropRatio) {
      issues.push(
        `${label}: sudden drop vs recentAvg (yesterday=${yesterday}, recentAvg=${recentAvg.toFixed(2)}, ratio=${ratio.toFixed(2)})`
      );
    }
  }

  return issues;
}

async function main() {
  const lookbackDays = Math.max(3, Math.floor(clampNumber(process.env.HEALTHCHECK_LOOKBACK_DAYS, 7)));
  const dropRatio = clampNumber(process.env.HEALTHCHECK_DROP_RATIO, 0.2);

  const propertyId = process.env.GA4_PROPERTY_ID;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!propertyId) throw new Error('GA4_PROPERTY_ID is required');
  if (!siteUrl) throw new Error('GSC_SITE_URL is required');

  const auth = buildAuthFromEnv();

  const todayUtc = new Date();
  const yesterdayUtc = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - 1));
  const dayBeforeUtc = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - 2));
  const startUtc = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - lookbackDays));

  const endDate = toDateStringUtc(yesterdayUtc);
  const startDate = toDateStringUtc(startUtc);
  const yDate = toDateStringUtc(yesterdayUtc);
  const dDate = toDateStringUtc(dayBeforeUtc);

  let ga4ByDate;
  let gscByDate;
  try {
    ga4ByDate = await fetchGa4DailySessions({ auth, propertyId, startDate, endDate });
  } catch (error) {
    const title = `📉 Analytics health-check failed (GA4 auth) ${yDate}`;
    const body = [
      '## Analytics Health Check',
      '',
      'GA4 API call failed (likely auth / permission issue).',
      '',
      `- Date checked (UTC): \`${yDate}\``,
      `- Property: \`${propertyId}\``,
      '',
      '### Error',
      '```',
      String(error?.message || error),
      '```',
      '',
      '### Action',
      '- Fix credentials / permissions for GA4 Data API.',
      '- On abnormal days, optimization workflows should be skipped.',
    ].join('\n');
    try {
      await ensureIssue({ title, body, labels: ['automated', 'analytics'] });
    } catch (e) {
      console.warn('⚠️ Failed to create issue:', e?.message || e);
    }
    appendGithubOutput('healthy', 'false');
    appendGithubOutput('reason', 'ga4_auth_failed');
    process.exit(0);
  }

  try {
    gscByDate = await fetchGscDailyClicks({ auth, siteUrl, startDate, endDate });
  } catch (error) {
    const title = `📉 Analytics health-check failed (GSC auth) ${yDate}`;
    const body = [
      '## Analytics Health Check',
      '',
      'Search Console API call failed (likely auth / permission issue).',
      '',
      `- Date checked (UTC): \`${yDate}\``,
      `- Site: \`${siteUrl}\``,
      '',
      '### Error',
      '```',
      String(error?.message || error),
      '```',
      '',
      '### Action',
      '- Fix credentials / permissions for Search Console API.',
      '- On abnormal days, optimization workflows should be skipped.',
    ].join('\n');
    try {
      await ensureIssue({ title, body, labels: ['automated', 'analytics'] });
    } catch (e) {
      console.warn('⚠️ Failed to create issue:', e?.message || e);
    }
    appendGithubOutput('healthy', 'false');
    appendGithubOutput('reason', 'gsc_auth_failed');
    process.exit(0);
  }

  const ga4Yesterday = Number(ga4ByDate.get(yDate) || 0);
  const ga4DayBefore = Number(ga4ByDate.get(dDate) || 0);
  const ga4RecentValues = [];
  for (const [date, value] of ga4ByDate.entries()) {
    if (date !== yDate) ga4RecentValues.push(Number(value || 0));
  }
  const ga4Avg = mean(ga4RecentValues);

  const gscYesterday = Number(gscByDate.get(yDate) || 0);
  const gscDayBefore = Number(gscByDate.get(dDate) || 0);
  const gscRecentValues = [];
  for (const [date, value] of gscByDate.entries()) {
    if (date !== yDate) gscRecentValues.push(Number(value || 0));
  }
  const gscAvg = mean(gscRecentValues);

  const problems = [
    ...evaluateSeries({
      label: 'GA4 sessions',
      yesterday: ga4Yesterday,
      dayBefore: ga4DayBefore,
      recentAvg: ga4Avg,
      dropRatio,
    }),
    ...evaluateSeries({
      label: 'GSC clicks',
      yesterday: gscYesterday,
      dayBefore: gscDayBefore,
      recentAvg: gscAvg,
      dropRatio,
    }),
  ];

  if (problems.length > 0) {
    const title = `📉 Analytics anomaly detected ${yDate}`;
    const body = [
      '## Analytics Health Check',
      '',
      'Abnormal values detected. Optimization workflows should be skipped for this run.',
      '',
      `- Date checked (UTC): \`${yDate}\``,
      `- Lookback days: \`${lookbackDays}\``,
      `- Drop ratio threshold: \`${dropRatio}\``,
      '',
      '### Metrics',
      `- GA4 sessions: yesterday=${ga4Yesterday}, dayBefore=${ga4DayBefore}, recentAvg=${ga4Avg.toFixed(2)}`,
      `- GSC clicks: yesterday=${gscYesterday}, dayBefore=${gscDayBefore}, recentAvg=${gscAvg.toFixed(2)}`,
      '',
      '### Detected Problems',
      ...problems.map((p) => `- ${p}`),
      '',
      '### Action',
      '- Check GA4 / Search Console dashboards for outages, tag issues, or tracking failures.',
      '- Verify deployments and consent banners.',
      '',
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n');

    try {
      await ensureIssue({ title, body, labels: ['automated', 'analytics'] });
      console.log('📝 Issue created (or already exists):', title);
    } catch (error) {
      console.warn('⚠️ Failed to create issue:', error?.message || error);
    }

    appendGithubOutput('healthy', 'false');
    appendGithubOutput('reason', 'anomaly_detected');
    process.exit(0);
  }

  console.log('✅ Analytics healthy');
  console.log(`- Date (UTC): ${yDate}`);
  console.log(`- GA4 sessions: ${ga4Yesterday}`);
  console.log(`- GSC clicks: ${gscYesterday}`);

  appendGithubOutput('healthy', 'true');
  appendGithubOutput('reason', 'ok');
}

main().catch((error) => {
  console.error('❌ analytics-health-check failed:', error?.message || error);
  try {
    const todayUtc = new Date();
    const date = toDateStringUtc(todayUtc);
    const title = `📉 Analytics health-check failed (script error) ${date}`;
    const body = [
      '## Analytics Health Check',
      '',
      'Script failed before completing checks (configuration or runtime error).',
      '',
      `- Date (UTC): \`${date}\``,
      '',
      '### Error',
      '```',
      String(error?.message || error),
      '```',
      '',
      '### Action',
      '- Verify required secrets/env: `GOOGLE_SERVICE_ACCOUNT_JSON`, `GA4_PROPERTY_ID`, `GSC_SITE_URL`.',
      '- Fix credentials/permissions if needed.',
      '- Optimization workflows should be skipped until this is resolved.',
      '',
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n');

    ensureIssue({ title, body, labels: ['automated', 'analytics'] }).catch(() => {});
  } catch {
    // ignore
  }

  // Fail-safe: mark unhealthy but do not fail the workflow.
  appendGithubOutput('healthy', 'false');
  appendGithubOutput('reason', 'script_error');
  process.exit(0);
});

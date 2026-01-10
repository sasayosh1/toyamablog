const fs = require('fs');
const path = require('path');

const deltaPath = path.resolve('reports/pages_with_jsonld_no_video.csv');
const postsJsonPath = path.resolve('reports/posts_youtube_status.json');
const outDir = path.resolve('reports');

if (!fs.existsSync(deltaPath)) {
  console.error('Delta file not found:', deltaPath);
  process.exit(2);
}
if (!fs.existsSync(postsJsonPath)) {
  console.error('Posts JSON not found:', postsJsonPath);
  process.exit(2);
}

const deltaText = fs.readFileSync(deltaPath, 'utf8').trim();
const deltaLines = deltaText.split(/\r?\n/).slice(1).filter(Boolean);
const deltaSlugs = new Set();
for (const line of deltaLines) {
  const parts = line.split(',');
  const slug = (parts[1] || '').trim();
  if (slug) deltaSlugs.add(slug);
}

const posts = JSON.parse(fs.readFileSync(postsJsonPath, 'utf8'));
const rows = [];
rows.push(['slug','title','youtubeUrl','foundInBody','bodyVideoId','videoIdFromField'].join(','));

for (const p of posts) {
  const slug = p.slug;
  if (!deltaSlugs.has(slug)) continue;
  const youtubeUrl = p.youtubeUrl || '';
  const foundInBody = !!p.foundInBody;
  const bodyVideoId = p.bodyVideoId || '';
  const videoIdFromField = p.videoIdFromField || '';
  if (!youtubeUrl.trim() && foundInBody) {
    // CSV-escape title by wrapping in double quotes and doubling existing quotes
    const safeTitle = (p.title || '').replace(/"/g,'""');
    rows.push([slug, '"' + safeTitle + '"', youtubeUrl, foundInBody, bodyVideoId, videoIdFromField].join(','));
  }
}

const outPath = path.join(outDir, 'candidates_body_detected_no_field.csv');
fs.writeFileSync(outPath, rows.join('\n'));
console.log('Wrote candidates:', outPath);

const fs = require('fs');
const path = require('path');

const root = path.resolve('.next/server/app/blog');
const outDir = path.resolve('reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function walk(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.isFile() && /\.(html|rsc|js)$/.test(e.name)) files.push(p);
  }
  return files;
}

function findScriptBlocks(content) {
  const re = /<script[^>]*type=(?:"|')application\/ld\+json(?:"|')[^>]*>([\s\S]*?)<\/script>/gi;
  const blocks = [];
  let m;
  while ((m = re.exec(content)) !== null) blocks.push(m[1].trim());
  return blocks;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text.replace(/^\)*/,'').replace(/\;*\)\)\s*$/,'').trim();
    try { return JSON.parse(cleaned); } catch (e2) { return null; }
  }
}

function findVideoInfo(obj) {
  const results = { found: false, videoObjs: [], hasContentUrlWatch: false, hasEmbedUrl: false, hasThumbnailUrl: false, hasUploadDate: false };
  const seen = new Set();
  function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (seen.has(o)) return; seen.add(o);
    if (o['@type'] === 'VideoObject') {
      results.found = true; results.videoObjs.push(o);
      if (o.contentUrl && /watch\?v=/.test(o.contentUrl)) results.hasContentUrlWatch = true;
      if (o.embedUrl) results.hasEmbedUrl = true;
      if (o.thumbnailUrl) results.hasThumbnailUrl = true;
      if (o.uploadDate) results.hasUploadDate = true;
    }
    if (o['@type'] === 'Article' && o.video) {
      const v = o.video;
      results.found = true;
      results.videoObjs.push(v);
      if (v.contentUrl && /watch\?v=/.test(v.contentUrl)) results.hasContentUrlWatch = true;
      if (v.embedUrl) results.hasEmbedUrl = true;
      if (v.thumbnailUrl) results.hasThumbnailUrl = true;
      if (v.uploadDate) results.hasUploadDate = true;
    }
    for (const k of Object.keys(o)) {
      try { walk(o[k]); } catch (e) {}
    }
  }
  walk(obj);
  return results;
}

const files = walk(root);
const report = [];
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const blocks = findScriptBlocks(content);
  const entry = { file: path.relative(process.cwd(), f), jsonld_count: blocks.length, parsed_count: 0, has_video: false, has_contentUrl_watch: false, has_embedUrl: false, has_thumbnailUrl: false, has_uploadDate: false, sample_video_object: null };
  for (const b of blocks) {
    const parsed = tryParseJson(b);
    if (!parsed) continue;
    entry.parsed_count++;
    const info = findVideoInfo(parsed);
    if (info.found) {
      entry.has_video = true;
      if (info.hasContentUrlWatch) entry.has_contentUrl_watch = true;
      if (info.hasEmbedUrl) entry.has_embedUrl = true;
      if (info.hasThumbnailUrl) entry.has_thumbnailUrl = true;
      if (info.hasUploadDate) entry.has_uploadDate = true;
      if (!entry.sample_video_object && info.videoObjs.length) entry.sample_video_object = info.videoObjs[0];
    }
  }
  report.push(entry);
}

const summary = {
  generatedAt: new Date().toISOString(),
  totalFiles: files.length,
  filesWithJsonLd: report.filter(r => r.jsonld_count>0).length,
  filesWithVideo: report.filter(r => r.has_video).length
};

fs.writeFileSync(path.join(outDir, 'jsonld_video_report.json'), JSON.stringify({ summary, report }, null, 2));
const csvLines = ['file,jsonld_count,parsed_count,has_video,has_contentUrl_watch,has_embedUrl,has_thumbnailUrl,has_uploadDate'];
for (const r of report) {
  csvLines.push([r.file,r.jsonld_count,r.parsed_count,r.has_video,r.has_contentUrl_watch,r.has_embedUrl,r.has_thumbnailUrl,r.has_uploadDate].join(','));
}
fs.writeFileSync(path.join(outDir,'jsonld_video_report.csv'), csvLines.join('\n'));

console.log('Done. Reports written to', outDir);
console.log('Summary:', summary);

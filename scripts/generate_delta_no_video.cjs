const fs = require('fs');
const path = require('path');

const inPath = path.resolve('reports/jsonld_video_report.json');
const outDir = path.resolve('reports');
if (!fs.existsSync(inPath)) {
  console.error('Input report not found:', inPath);
  process.exit(2);
}
const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
const report = data.report || [];

const rows = [];
rows.push(['file','slug','jsonld_count','parsed_count','has_video','has_contentUrl_watch','has_embedUrl','has_thumbnailUrl','has_uploadDate'].join(','));
for (const r of report) {
  if (r.jsonld_count > 0 && !r.has_video) {
    const file = r.file.replace(/\\/g,'/');
    const base = path.basename(file);
    const slug = base.replace(/\.(html|rsc|js)$/,'');
    rows.push([r.file, slug, r.jsonld_count, r.parsed_count, r.has_video, r.has_contentUrl_watch, r.has_embedUrl, r.has_thumbnailUrl, r.has_uploadDate].join(','));
  }
}

const outPath = path.join(outDir, 'pages_with_jsonld_no_video.csv');
fs.writeFileSync(outPath, rows.join('\n'));
console.log('Wrote delta report:', outPath);

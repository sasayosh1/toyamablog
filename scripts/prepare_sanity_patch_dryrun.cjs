const fs = require('fs');
const path = require('path');

const inPath = path.resolve('reports/candidates_body_detected_no_field.csv');
const outDir = path.resolve('reports');
if (!fs.existsSync(inPath)) {
  console.error('Input candidates CSV not found:', inPath);
  process.exit(2);
}

const lines = fs.readFileSync(inPath, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);
const plan = [];
for (const line of lines) {
  // slug,title,youtubeUrl,foundInBody,bodyVideoId,videoIdFromField
  // title may be quoted and contain commas; handle CSV roughly by splitting first field (slug) and last 3 fields
  const parts = line.split(',');
  const slug = parts[0];
  const foundInBody = parts[3] === 'true';
  const bodyVideoId = parts.slice(4,5)[0] || parts[4] || '';
  const bodyId = parts[4] || '';
  // best-effort: try to extract the 5th column as bodyVideoId
  const bodyVideoIdClean = bodyVideoId.replace(/"/g,'').trim();
  if (!foundInBody || !bodyVideoIdClean) continue;
  const youtubeUrlToSet = `https://youtu.be/${bodyVideoIdClean}`;
  plan.push({ slug, bodyVideoId: bodyVideoIdClean, youtubeUrlToSet });
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const planPath = path.join(outDir, 'sanity_patch_plan.json');
fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));

// Generate a commands script that, when run with SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN and jq installed,
// will query each document by slug, then apply a patch. This script is a dry-run generator; it won't run automatically here.
const cmdLines = [];
cmdLines.push('#!/usr/bin/env bash');
cmdLines.push('set -euo pipefail');
cmdLines.push('');
cmdLines.push('if [ -z "${SANITY_PROJECT_ID:-}" ] || [ -z "${SANITY_DATASET:-}" ] || [ -z "${SANITY_TOKEN:-}" ]; then');
cmdLines.push('  echo "Please set SANITY_PROJECT_ID, SANITY_DATASET and SANITY_TOKEN in your environment."');
cmdLines.push('  exit 1');
cmdLines.push('fi');
cmdLines.push('BASE_URL="https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07"');
cmdLines.push('');
for (const item of plan) {
  const slug = item.slug;
  const url = item.youtubeUrlToSet;
  cmdLines.push('echo "--- Processing slug: ' + slug + ' -> ' + url + '"');
  cmdLines.push('DOC_JSON=$(curl -s "${BASE_URL}/data/query/${SANITY_DATASET}?query=*%5Bslug.current%3D%3D\'' + slug + '\'%5D%7B_id%7D[0]")');
  cmdLines.push('DOC_ID=$(echo "$DOC_JSON" | jq -r ".result._id // empty")');
  cmdLines.push('if [ -z "$DOC_ID" ]; then');
  cmdLines.push('  echo "Document not found for slug: ' + slug + '"');
  cmdLines.push('  continue');
  cmdLines.push('fi');
  cmdLines.push('echo "Found id: $DOC_ID"');
    cmdLines.push('echo "Mutation payload (replace <DOC_ID> with id shown above):"');
    cmdLines.push('echo \'{"mutations":[{"patch":{"id":"<DOC_ID>","set":{"youtubeUrl":"' + url + '"}}}]}\'');
    cmdLines.push('echo "To apply: replace <DOC_ID> and run the following cURL command (ensure SANITY_TOKEN is set):"');
    cmdLines.push('echo curl -s -X POST "$BASE_URL/data/mutate/${SANITY_DATASET}" -H "Authorization: Bearer ${SANITY_TOKEN}" -H "Content-Type: application/json" -d @- <<JSON');
    cmdLines.push('echo \'{"mutations":[{"patch":{"id":"<DOC_ID>","set":{"youtubeUrl":"' + url + '"}}}]}\'');
    cmdLines.push('echo JSON');
  cmdLines.push('echo');
}

const cmdPath = path.join(outDir, 'sanity_patch_commands_dryrun.sh');
fs.writeFileSync(cmdPath, cmdLines.join('\n'));
fs.chmodSync(cmdPath, 0o755);

console.log('Wrote plan:', planPath);
console.log('Wrote commands script:', cmdPath);

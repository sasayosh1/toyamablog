const fs = require('fs');
const path = require('path');

const planPath = path.resolve('reports/sanity_patch_plan.json');
if (!fs.existsSync(planPath)) {
  console.error('Plan not found:', planPath);
  process.exit(2);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

const PROJECT = process.env.SANITY_PROJECT_ID || '';
const DATASET = process.env.SANITY_DATASET || '';
const TOKEN = process.env.SANITY_TOKEN || '';
const APPLY = !!process.env.SANITY_APPLY;

if (!PROJECT || !DATASET) {
  console.error('Please set SANITY_PROJECT_ID and SANITY_DATASET in the environment.');
  process.exit(2);
}

const BASE = `https://${PROJECT}.api.sanity.io/v2021-06-07`;

async function fetchJson(url, opts={}){
  const r = await fetch(url, opts);
  const txt = await r.text();
  try { return JSON.parse(txt); } catch(e){ return { raw: txt, status: r.status }; }
}

(async ()=>{
  if (!plan.length) { console.log('No items in plan'); return; }
  console.log(`${plan.length} items in plan. SANITY_APPLY=${APPLY}`);
  for (const item of plan) {
    const slug = item.slug;
    const url = item.youtubeUrlToSet;
    console.log('---', slug, '->', url);
    const groq = `*[slug.current=="${slug}"]{_id}[0]`;
    const qUrl = `${BASE}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`;
    const docResp = await fetchJson(qUrl, { method: 'GET' });
    const docId = docResp?.result?._id || docResp?.result?._id || (docResp && docResp._id) || null;
    if (!docId) {
      console.warn('Document not found for slug:', slug, 'response:', docResp);
      continue;
    }
    console.log('Found id:', docId);
    const mutation = { mutations: [{ patch: { id: docId, set: { youtubeUrl: url } } }] };
    console.log('Payload:', JSON.stringify(mutation));
    if (!APPLY) {
      console.log('(dry-run) not applying. To apply set SANITY_APPLY=1 and ensure SANITY_TOKEN is present.');
      continue;
    }
    if (!TOKEN) {
      console.error('SANITY_APPLY set but SANITY_TOKEN is missing. Aborting.');
      process.exit(3);
    }
    const mutateUrl = `${BASE}/data/mutate/${DATASET}`;
    const res = await fetchJson(mutateUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` }, body: JSON.stringify(mutation) });
    console.log('Mutate response:', res);
  }
})();

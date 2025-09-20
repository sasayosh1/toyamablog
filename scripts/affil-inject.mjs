#!/usr/bin/env node
/**
 * Affil auto-inject runner
 * - 読み込んだ本文を /api/affil/inject に投げて、返ってきた result で上書き
 * - .mdx は type=mdx、それ以外は type=html（--type で明示も可）
 * - 上書き前に .bak を作成
 *
 * 使い方:
 *   node scripts/affil-inject.mjs path/to/file.mdx
 *   node scripts/affil-inject.mjs path/to/file.html --type html
 *   AFFIL_INJECT_ENDPOINT="http://localhost:3000/api/affil/inject" node scripts/affil-inject.mjs ...
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: affil-inject <file> [--type mdx|html] [--endpoint URL]");
  process.exit(1);
}

let file = args[0];
if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}

let typeFlag = null;
let endpointFlag = null;
for (let i = 1; i < args.length; i++) {
  if (args[i] === "--type" && args[i + 1]) {
    typeFlag = args[i + 1];
    i++;
  } else if (args[i] === "--endpoint" && args[i + 1]) {
    endpointFlag = args[i + 1];
    i++;
  }
}

const ext = path.extname(file).toLowerCase();
const detectedType = ext === ".mdx" ? "mdx" : "html";
const type = typeFlag || detectedType;

// デフォルトのエンドポイント（Next.js dev/prod どちらでもOK）
const endpoint =
  endpointFlag ||
  process.env.AFFIL_INJECT_ENDPOINT ||
  "http://localhost:3001/api/affil/inject";

async function main() {
  const original = fs.readFileSync(file, "utf8");

  // バックアップ
  const bak = `${file}.bak`;
  fs.writeFileSync(bak, original, "utf8");

  // 送信
  const payload = { type, content: original };
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error(`Request failed (${res.status}): ${await res.text()}`);
    process.exit(1);
  }

  const json = await res.json();
  if (!json?.ok) {
    console.error(`API error: ${JSON.stringify(json)}`);
    process.exit(1);
  }

  const out = json.result ?? "";
  if (typeof out !== "string" || out.trim().length === 0) {
    console.error("Empty result from API");
    process.exit(1);
  }

  // 上書き
  fs.writeFileSync(file, out, "utf8");

  // 簡易差分（行数の変化だけ出す）
  const beforeLines = original.split(/\r?\n/).length;
  const afterLines = out.split(/\r?\n/).length;

  console.log(
    `✔ Injected: ${file}\n   type=${type}  endpoint=${endpoint}\n   lines: ${beforeLines} → ${afterLines}\n   backup: ${bak}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
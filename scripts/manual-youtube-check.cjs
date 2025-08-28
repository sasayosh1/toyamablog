#!/usr/bin/env node

/**
 * 手動でYouTubeチェックを実行するスクリプト
 * 使用方法: node scripts/manual-youtube-check.js
 */

require('dotenv').config();
const { main } = require('./check-youtube-and-create-articles.cjs');

console.log('🚀 手動でYouTubeチャンネルチェックを開始します...');
console.log('⏰ 実行時刻:', new Date().toLocaleString('ja-JP'));

main()
  .then(() => {
    console.log('✅ YouTubeチェック完了');
  })
  .catch((error) => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  });
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// デフォルト設定値
const defaultConfig = {
  // Sanity設定
  NEXT_PUBLIC_SANITY_PROJECT_ID: 'aoxze287',
  NEXT_PUBLIC_SANITY_DATASET: 'production',
  NEXT_PUBLIC_SANITY_API_VERSION: '2024-01-01',
  SANITY_API_READ_TOKEN: '',
  
  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',
  
  // YouTube（よく使う値をデフォルトに）
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  NEXT_PUBLIC_YOUTUBE_CHANNEL_ID: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '',
  
  // Vercel
  VERCEL_URL: 'your-vercel-domain.vercel.app'
}

// 環境変数ファイル生成
function generateEnvFile() {
  const envContent = Object.entries(defaultConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  fs.writeFileSync('.env.local', envContent)
  console.log('✅ .env.local ファイルを生成しました')
  console.log('📝 必要に応じて値を編集してください')
}

// 既存ファイルのバックアップ
function backupExistingEnv() {
  if (fs.existsSync('.env.local')) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    fs.copyFileSync('.env.local', `.env.local.backup.${timestamp}`)
    console.log(`📦 既存の .env.local をバックアップしました`)
  }
}

console.log('🔧 環境変数セットアップスクリプト')
backupExistingEnv()
generateEnvFile()
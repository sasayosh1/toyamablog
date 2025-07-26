#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const templates = require('../config/env-templates.json')

function showUsage() {
  console.log(`
🔧 環境変数管理ツール

使用方法:
  npm run env:dev     - 開発環境の設定を適用
  npm run env:prod    - 本番環境の設定を適用
  npm run env:backup  - 現在の設定をバックアップ
  npm run env:restore - バックアップから復元
  `)
}

function applyTemplate(templateName) {
  const template = templates[templateName]
  if (!template) {
    console.error(`❌ テンプレート "${templateName}" が見つかりません`)
    return
  }

  // バックアップ作成
  if (fs.existsSync('.env.local')) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    fs.copyFileSync('.env.local', `.env.local.backup.${timestamp}`)
    console.log(`📦 既存設定をバックアップしました`)
  }

  // 新しい設定を適用
  const envContent = Object.entries(template)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  
  fs.writeFileSync('.env.local', envContent)
  console.log(`✅ ${templateName} 環境の設定を適用しました`)
  
  // 空の値があれば警告
  const emptyVars = Object.entries(template)
    .filter(([key, value]) => value === '' || value.startsWith('${'))
    .map(([key]) => key)
  
  if (emptyVars.length > 0) {
    console.log(`⚠️  以下の変数に値を設定してください:`)
    emptyVars.forEach(key => console.log(`   - ${key}`))
  }
}

function createBackup() {
  if (!fs.existsSync('.env.local')) {
    console.log('❌ .env.local ファイルが存在しません')
    return
  }
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
  fs.copyFileSync('.env.local', `.env.local.backup.${timestamp}`)
  console.log(`✅ バックアップを作成しました: .env.local.backup.${timestamp}`)
}

function restoreBackup() {
  const backupFiles = fs.readdirSync('.')
    .filter(file => file.startsWith('.env.local.backup.'))
    .sort()
    .reverse()
  
  if (backupFiles.length === 0) {
    console.log('❌ バックアップファイルが見つかりません')
    return
  }
  
  const latestBackup = backupFiles[0]
  fs.copyFileSync(latestBackup, '.env.local')
  console.log(`✅ ${latestBackup} から復元しました`)
}

const command = process.argv[2]

switch (command) {
  case 'dev':
    applyTemplate('development')
    break
  case 'prod':
    applyTemplate('production')
    break
  case 'backup':
    createBackup()
    break
  case 'restore':
    restoreBackup()
    break
  default:
    showUsage()
}
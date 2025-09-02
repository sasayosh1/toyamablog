// 確実な画像表示のためのユーティリティ

// Base64エンコードされた小さな富山のロゴ画像（確実な表示用）
export const FALLBACK_IMAGE_BASE64 = `data:image/svg+xml;base64,${btoa(`
<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#f3f4f6"/>
  <path d="M0 200 L50 150 L100 120 L150 100 L200 90 L250 100 L300 120 L350 150 L400 200 L400 300 L0 300 Z" fill="#e5e7eb"/>
  <path d="M0 220 L80 180 L160 160 L240 170 L320 180 L400 220 L400 300 L0 300 Z" fill="#d1d5db"/>
  <path d="M0 250 L100 210 L200 200 L300 210 L400 250 L400 300 L0 300 Z" fill="#9ca3af"/>
  <text x="200" y="150" font-family="'Hiragino Sans', 'Yu Gothic', sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#374151">富山のくせに</text>
  <text x="200" y="175" font-family="Arial, sans-serif" font-size="14" font-weight="normal" text-anchor="middle" fill="#6b7280">AMAZING TOYAMA</text>
</svg>
`)}`

// Base64エンコードされた小さなサムネイル画像（確実な表示用）
export const FALLBACK_THUMBNAIL_BASE64 = `data:image/svg+xml;base64,${btoa(`
<svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="200" fill="#f8f9fa"/>
  <path d="M0 120 L60 80 L120 60 L180 70 L240 80 L300 120 L300 200 L0 200 Z" fill="#dee2e6"/>
  <circle cx="80" cy="40" r="15" fill="#ffc107"/>
  <text x="150" y="110" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#495057">富山のくせに</text>
</svg>
`)}`

// 確実な画像URLを取得する関数
export function getSecureImageUrl(imagePath: string, fallbackBase64?: string): string {
  // 絶対URLの場合はそのまま返す
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath
  }
  
  // 相対パスの場合は絶対パスに変換
  if (imagePath && imagePath.startsWith('/')) {
    return imagePath
  }
  
  // パスが無効な場合はフォールバック画像を返す
  return fallbackBase64 || FALLBACK_THUMBNAIL_BASE64
}

// ヒーロー画像の確実なURLを取得
export function getHeroImageUrl(): string {
  return getSecureImageUrl('/images/toyama-hero.png', FALLBACK_IMAGE_BASE64)
}

// サムネイル画像の確実なURLを取得
export function getThumbnailImageUrl(thumbnailPath?: string): string {
  if (!thumbnailPath) {
    return FALLBACK_THUMBNAIL_BASE64
  }
  return getSecureImageUrl(thumbnailPath, FALLBACK_THUMBNAIL_BASE64)
}
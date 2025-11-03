// 確実な画像表示のためのユーティリティ

// URLエンコードされたSVG画像（サーバーサイド対応）
export const FALLBACK_IMAGE_BASE64 = `data:image/svg+xml,%3Csvg width='400' height='300' viewBox='0 0 400 300' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Cpath d='M0 200 L50 150 L100 120 L150 100 L200 90 L250 100 L300 120 L350 150 L400 200 L400 300 L0 300 Z' fill='%23e5e7eb'/%3E%3Cpath d='M0 220 L80 180 L160 160 L240 170 L320 180 L400 220 L400 300 L0 300 Z' fill='%23d1d5db'/%3E%3Cpath d='M0 250 L100 210 L200 200 L300 210 L400 250 L400 300 L0 300 Z' fill='%239ca3af'/%3E%3Ctext x='200' y='150' font-family='Hiragino Sans, Yu Gothic, sans-serif' font-size='24' font-weight='bold' text-anchor='middle' fill='%23374151'%3E%E5%AF%8C%E5%B1%B1%E3%80%81%E3%81%8A%E5%A5%BD%E3%81%8D%E3%81%A7%E3%81%99%E3%81%8B%EF%BC%9F%3C/text%3E%3Ctext x='200' y='175' font-family='Arial, sans-serif' font-size='14' font-weight='normal' text-anchor='middle' fill='%236b7280'%3EAMAZING TOYAMA%3C/text%3E%3C/svg%3E`

// URLエンコードされたサムネイル画像（サーバーサイド対応）
export const FALLBACK_THUMBNAIL_BASE64 = `data:image/svg+xml,%3Csvg width='300' height='200' viewBox='0 0 300 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='300' height='200' fill='%23f8f9fa'/%3E%3Cpath d='M0 120 L60 80 L120 60 L180 70 L240 80 L300 120 L300 200 L0 200 Z' fill='%23dee2e6'/%3E%3Ccircle cx='80' cy='40' r='15' fill='%23ffc107'/%3E%3Ctext x='150' y='110' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle' fill='%23495057'%3E%E5%AF%8C%E5%B1%B1%E3%80%81%E3%81%8A%E5%A5%BD%E3%81%8D%E3%81%A7%E3%81%99%E3%81%8B%EF%BC%9F%3C/text%3E%3C/svg%3E`

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

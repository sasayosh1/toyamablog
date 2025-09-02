// カスタム画像ローダー - Next.js画像最適化を完全無効化
export default function customImageLoader({ src }: { src: string }) {
  // 絶対URLの場合はそのまま返す
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // 相対パスの場合は絶対パスに変換
  if (src.startsWith('/')) {
    return src;
  }
  
  // その他の場合は/を先頭に追加
  return `/${src}`;
}
export function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;

  try {
    // YouTube Shorts URLも含む改良された正規表現
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    if (!videoIdMatch || !videoIdMatch[1]) {
      return null;
    }

    const videoId = videoIdMatch[1];
    
    // 高品質サムネイル（maxresdefault）を優先、フォールバックでhqdefaultを使用
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  } catch (error) {
    console.error('YouTube thumbnail extraction error:', error);
    return null;
  }
}

export function getYouTubeThumbnailWithFallback(url: string): string | null {
  if (!url) return null;

  try {
    // YouTube Shorts URLも含む改良された正規表現
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    if (!videoIdMatch || !videoIdMatch[1]) {
      return null;
    }

    const videoId = videoIdMatch[1];
    
    // mqdefaultを使用（より確実に存在する）
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  } catch (error) {
    console.error('YouTube thumbnail extraction error:', error);
    return null;
  }
}
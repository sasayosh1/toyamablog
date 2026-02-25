'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'


// フォールバック対応サムネイル画像コンポーネント
interface ThumbnailImageProps {
  urls: string[]
  alt: string
  priority: boolean
}

function ThumbnailImage({ urls, alt, priority }: ThumbnailImageProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState('')

  // URL変更時にローディング状態をリセット
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)
    setDebugInfo(`試行中: ${urls[currentUrlIndex]?.substring(0, 50)}...`)
  }, [currentUrlIndex, urls])

  // タイムアウト処理（10秒後に次のURLに移行）
  useEffect(() => {
    if (!isLoading) return

    const timeout = setTimeout(() => {
      if (isLoading && retryCount < 2) {
        setRetryCount(prev => prev + 1)
        // 再試行
        const img = new Image()
        img.onload = handleImageLoad
        img.onerror = handleImageError
        img.src = urls[currentUrlIndex]
      } else {
        handleImageError()
      }
    }, 10000) // 10秒タイムアウト

    return () => clearTimeout(timeout)
  }, [isLoading, retryCount, currentUrlIndex, urls])

  const handleImageError = () => {
    console.log(`画像読み込み失敗: ${urls[currentUrlIndex]} (試行 ${currentUrlIndex + 1}/${urls.length})`)
    setCurrentUrlIndex(prev => {
      if (prev < urls.length - 1) {
        const nextIndex = prev + 1
        setDebugInfo(`失敗、次を試行中: ${urls[nextIndex]?.substring(0, 50)}...`)
        return nextIndex
      } else {
        setHasError(true)
        setIsLoading(false)
        setDebugInfo('すべてのURLで失敗')
        return prev
      }
    })
  }

  const handleImageLoad = () => {
    console.log(`画像読み込み成功: ${urls[currentUrlIndex]}`)
    setIsLoading(false)
    setHasError(false)
    setDebugInfo('読み込み成功')
  }

  // 全URLで失敗した場合
  if (hasError || currentUrlIndex >= urls.length) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-xs">画像を読み込めませんでした</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">読み込み中...</span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 px-2 text-center max-w-full break-words">
                {debugInfo}
              </div>
            )}
          </div>
        </div>
      )}
      <img
        src={urls[currentUrlIndex]}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        loading={priority ? "eager" : "lazy"}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={() => setIsLoading(true)}
      />
    </div>
  )
}

// CategoryTag コンポーネント（スタイルのみ、クリックできない）
interface CategoryTagProps {
  className: string
  children: React.ReactNode
}

function CategoryTag({ className, children }: CategoryTagProps) {
  return (
    <span className={className}>
      {children}
    </span>
  )
}

interface PostCardProps {
  post: {
    _id: string
    title: string
    titleEn?: string
    slug: { current: string }
    youtubeUrl?: string
    youtubeVideo?: {
      _type: string
      title?: string
      url?: string
      videoId?: string
    }
    categories?: string[]
    excerpt?: string
    excerptEn?: string
    displayExcerpt?: string
    thumbnail?: {
      asset: {
        _ref: string
        url: string
      }
      alt?: string
    }
  }
  priority?: boolean
  basePath?: string
  locale?: 'ja' | 'en'
}

export default function PostCard({ post, priority = false, basePath = '', locale = 'ja' }: PostCardProps) {
  // タイトルから#shortsを削除
  const cleanTitleJa = post.title.replace(/\s*#shorts\s*/gi, '').trim();
  const cleanTitle = locale === 'en' && post.titleEn
    ? post.titleEn.replace(/\s*#shorts\s*/gi, '').trim()
    : cleanTitleJa;

  const excerpt = locale === 'en' && post.excerptEn
    ? post.excerptEn
    : post.displayExcerpt || post.excerpt;

  // 改善されたサムネイル画像取得（信頼性重視）
  const getThumbnailUrls = () => {
    const urls = [];

    // 1. Sanityサムネイルが存在する場合（最も信頼性が高い）
    if (post.thumbnail?.asset?.url) {
      urls.push(post.thumbnail.asset.url);
    }

    // 2. YouTubeURLが存在する場合（youtubeUrl または youtubeVideo.url）
    const youtubeUrl = post.youtubeUrl || post.youtubeVideo?.url;
    if (youtubeUrl) {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      if (videoId) {
        // YouTube画像の品質順（存在する可能性が高い順）
        urls.push(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
        urls.push(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
        urls.push(`https://i.ytimg.com/vi/${videoId}/default.jpg`);
        urls.push(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
      }
    }

    // 3. 地域別のカテゴリ色フォールバック（確実なフォールバック）
    const categoryColor = getCategoryColor(post.categories?.[0]);
    const fallbackSvg = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${categoryColor.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${adjustBrightness(categoryColor.bg, -20)};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" fill="url(#bg)"/>
        <circle cx="200" cy="112" r="40" fill="${categoryColor.text}" opacity="0.1"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" 
              fill="${categoryColor.text}" font-size="16" font-family="system-ui, -apple-system, sans-serif" font-weight="600">
          ${post.categories?.[0] || '富山、お好きですか？'}
        </text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
              fill="${categoryColor.text}" font-size="11" font-family="system-ui, -apple-system, sans-serif" opacity="0.9">
          ${cleanTitle.length > 35 ? cleanTitle.substring(0, 32) + '...' : cleanTitle}
        </text>
      </svg>
    `)}`;
    urls.push(fallbackSvg);

    return urls;
  };

  // 色の明度調整ヘルパー関数
  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // カテゴリ別の色彩定義
  const getCategoryColor = (category?: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      'グルメ': { bg: '#FF5722', text: 'white' },
      '自然・公園': { bg: '#4CAF50', text: 'white' },
      '観光スポット': { bg: '#2196F3', text: 'white' },
      '文化・歴史': { bg: '#9C27B0', text: 'white' },
      'イベント': { bg: '#FF9800', text: 'white' },
      '温泉': { bg: '#E91E63', text: 'white' },
    };
    return colorMap[category || ''] || { bg: '#757575', text: 'white' };
  };

  const thumbnailUrls = getThumbnailUrls();

  return (
    <Link
      href={`${basePath}/blog/${post.slug.current}`}
      className="block h-full"
      data-testid="article-card"
      aria-label={`記事「${cleanTitle}」を読む`}
    >
      <article className="bg-white rounded-2xl overflow-hidden h-full flex flex-col hover-card-effect border border-gray-100" role="article">
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <ThumbnailImage
            urls={thumbnailUrls}
            alt={post.thumbnail?.alt || `${cleanTitle} サムネイル`}
            priority={priority}
          />
          {post.categories && post.categories.length > 0 && (
            <div className="absolute top-3 left-3 z-10">
              <CategoryTag
                className="px-3 py-1 bg-white/90 backdrop-blur-sm text-toyama-blue-dark text-xs font-bold rounded-full shadow-sm"
              >
                {post.categories[0]}
              </CategoryTag>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-800 line-clamp-2 leading-snug group-hover:text-toyama-blue transition-colors">
            {cleanTitle}
          </h3>

          {excerpt && (
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
              {excerpt}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>{locale === 'en' ? 'Read Article' : '記事を読む'}</span>
            <span className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-toyama-blue">
              →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

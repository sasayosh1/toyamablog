'use client'

import Link from 'next/link'
import { useState } from 'react'
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

  const handleImageError = () => {
    if (currentUrlIndex < urls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1)
    } else {
      setIsLoading(false)
    }
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  if (currentUrlIndex >= urls.length) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-sm">画像を読み込めませんでした</span>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={urls[currentUrlIndex]}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={priority ? "eager" : "lazy"}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </>
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
    slug: { current: string }
    youtubeUrl?: string
    categories?: string[]
    excerpt?: string
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
}

export default function PostCard({ post, priority = false }: PostCardProps) {
  // タイトルから#shortsを削除
  const cleanTitle = post.title.replace(/\s*#shorts\s*/gi, '').trim();
  
  // 改善されたサムネイル画像取得
  const getThumbnailUrls = () => {
    const urls = [];
    
    // 1. YouTubeURLが存在する場合（最優先）
    if (post.youtubeUrl) {
      const youtubeThumb = getYouTubeThumbnailWithFallback(post.youtubeUrl);
      if (youtubeThumb) {
        urls.push(youtubeThumb);
        
        // 複数のYouTube画質オプション
        const videoId = post.youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (videoId) {
          urls.push(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
          urls.push(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
          urls.push(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
        }
      }
    }

    // 2. Sanityサムネイルが存在する場合
    if (post.thumbnail?.asset?.url) {
      urls.push(post.thumbnail.asset.url);
    }

    // 3. カテゴリ別のカラーサムネイル（確実なフォールバック）
    const categoryColor = getCategoryColor(post.categories?.[0]);
    const fallbackSvg = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
        <rect width="400" height="225" fill="${categoryColor.bg}"/>
        <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" 
              fill="${categoryColor.text}" font-size="18" font-family="Arial, sans-serif" font-weight="bold">
          ${post.categories?.[0] || '記事'}
        </text>
        <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" 
              fill="${categoryColor.text}" font-size="12" font-family="Arial, sans-serif">
          ${cleanTitle.length > 30 ? cleanTitle.substring(0, 30) + '...' : cleanTitle}
        </text>
      </svg>
    `)}`;
    urls.push(fallbackSvg);
    
    return urls;
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
      href={`/blog/${post.slug.current}`}
      className="block min-h-[44px]"
      data-testid="article-card"
      aria-label={`記事「${cleanTitle}」を読む`}
    >
      <article className="bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer relative z-[1]" role="article">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <ThumbnailImage
            urls={thumbnailUrls}
            alt={post.thumbnail?.alt || `${cleanTitle} サムネイル`}
            priority={priority}
          />
        </div>
        
        <div className="p-5 md:p-6 min-h-[44px]">
          <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-800 line-clamp-2 leading-tight">
            {cleanTitle}
          </h3>
          
          {post.categories && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.categories.slice(0, 2).map((category) => (
                <CategoryTag
                  key={category}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                >
                  {category}
                </CategoryTag>
              ))}
            </div>
          )}

          {(post.displayExcerpt || post.excerpt) && (
            <p className="text-gray-800 text-sm line-clamp-2 leading-relaxed">
              {post.displayExcerpt || post.excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
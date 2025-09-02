'use client'

import Link from 'next/link'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'
import { getThumbnailImageUrl, FALLBACK_THUMBNAIL_BASE64 } from '@/lib/image-utils'


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
  
  // 確実なサムネイル画像取得（Base64フォールバック付き）
  const getThumbnailUrl = () => {
    // 1. YouTubeURLが存在する場合
    if (post.youtubeUrl) {
      const youtubeThumb = getYouTubeThumbnailWithFallback(post.youtubeUrl);
      if (youtubeThumb) {
        return getThumbnailImageUrl(youtubeThumb);
      }
    }
    // 2. Sanityサムネイルが存在する場合
    if (post.thumbnail?.asset?.url) {
      return getThumbnailImageUrl(post.thumbnail.asset.url);
    }
    // 3. 確実なフォールバック（Base64エンコード画像）
    return FALLBACK_THUMBNAIL_BASE64;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <Link 
      href={`/blog/${post.slug.current}`}
      className="block min-h-[44px]"
      data-testid="article-card"
      aria-label={`記事「${cleanTitle}」を読む`}
    >
      <article className="bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer relative z-[1]" role="article">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={thumbnailUrl}
            alt={post.thumbnail?.alt || `${cleanTitle} サムネイル`}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.includes('data:image')) {
                img.src = FALLBACK_THUMBNAIL_BASE64;
              }
            }}
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
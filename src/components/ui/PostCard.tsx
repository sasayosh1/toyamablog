'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'


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
  
  // サムネイル優先順位: 1.Sanity画像 > 2.YouTube動的取得 > 3.フォールバック
  const getThumbnailUrl = () => {
    // 1. Sanity画像が存在する場合
    if (post.thumbnail?.asset?.url) {
      return post.thumbnail.asset.url;
    }
    // 2. YouTubeURLが存在する場合
    if (post.youtubeUrl) {
      const youtubeThumb = getYouTubeThumbnailWithFallback(post.youtubeUrl);
      if (youtubeThumb) {
        return youtubeThumb;
      }
    }
    // 3. フォールバック画像
    return '/images/default-thumbnail.svg';
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
          <Image
            src={thumbnailUrl}
            alt={post.thumbnail?.alt || `${cleanTitle} サムネイル`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={priority ? 90 : 75}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
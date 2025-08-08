'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'

// CategoryLink コンポーネント（Client Component）
interface CategoryLinkProps {
  href: string
  className: string
  category: string
  children: React.ReactNode
}

function CategoryLink({ href, className, category, children }: CategoryLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </Link>
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
  }
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link 
      href={`/blog/${post.slug.current}`}
      className="block"
    >
      <article className="bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer relative z-[1]">
        {post.youtubeUrl && getYouTubeThumbnailWithFallback(post.youtubeUrl) && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={getYouTubeThumbnailWithFallback(post.youtubeUrl) || ''}
              alt={`${post.title} - YouTube動画サムネイル`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </div>
          </div>
        )}
        
        <div className="p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800 line-clamp-2 leading-tight">
            {post.title}
          </h2>
          
          {post.categories && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.categories.slice(0, 2).map((category) => (
                <CategoryLink
                  key={category}
                  href={`/category/${encodeURIComponent(category)}`}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-100 transition-colors"
                  category={category}
                >
                  {category}
                </CategoryLink>
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
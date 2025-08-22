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
  }
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link 
      href={`/blog/${post.slug.current}`}
      className="block"
    >
      <article className="bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer relative z-[1]">
        {post.youtubeUrl && (
          <div className="relative h-48 overflow-hidden bg-gray-100">
            <Image
              src={getYouTubeThumbnailWithFallback(post.youtubeUrl) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRkY0NDQ0Ii8+CjxwYXRoIGQ9Ik0xMDUgNjBMMTk1IDEyMEwxMDUgMTgwVjYwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'}
              alt={`${post.title} - YouTube動画サムネイル`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={false}
              priority={false}
            />
          </div>
        )}
        
        <div className="p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800 line-clamp-2 leading-tight">
            {post.title}
          </h2>
          
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
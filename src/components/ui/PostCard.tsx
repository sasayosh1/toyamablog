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
            {(() => {
              const thumbnailUrl = getYouTubeThumbnailWithFallback(post.youtubeUrl!);
              
              if (thumbnailUrl) {
                return (
                  <Image
                    src={thumbnailUrl}
                    alt={`${post.title} - YouTube動画サムネイル`}
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex items-center justify-center h-full bg-gradient-to-br from-red-500 to-red-600">
                            <div class="text-white text-center p-4">
                              <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a2.998 2.998 0 00-2.11-2.123C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.518A2.998 2.998 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.998 2.998 0 002.11 2.123c1.883.518 9.388.518 9.388.518s7.505 0 9.388-.518a2.998 2.998 0 002.11-2.123C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.6 15.568V8.432L15.84 12 9.6 15.568z"/>
                              </svg>
                              <p class="text-sm font-medium">YouTube動画</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.opacity = '1';
                    }}
                  />
                );
              } else {
                // サムネイルURLが取得できない場合はYouTubeプレースホルダーを表示
                return (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-500 to-red-600">
                    <div className="text-white text-center p-4">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a2.998 2.998 0 00-2.11-2.123C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.518A2.998 2.998 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.998 2.998 0 002.11 2.123c1.883.518 9.388.518 9.388.518s7.505 0 9.388-.518a2.998 2.998 0 002.11-2.123C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.6 15.568V8.432L15.84 12 9.6 15.568z"/>
                      </svg>
                      <p className="text-sm font-medium">YouTube動画</p>
                    </div>
                  </div>
                );
              }
            })()}
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
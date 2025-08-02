'use client'

import { useState, useRef, useEffect } from 'react'
import { Post } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'

interface SearchBoxProps {
  posts: Post[]
}

export default function SearchBox({ posts }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 検索結果をフィルタリング
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts([])
      setIsOpen(false)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.categories?.some(cat => cat.toLowerCase().includes(query)) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, 10) // 最大10件まで表示

    setFilteredPosts(filtered)
    setIsOpen(filtered.length > 0)
  }, [searchQuery, posts])

  // 外部クリックで検索結果を閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 検索結果をクリックした時の処理
  const handleResultClick = () => {
    setSearchQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      {/* 検索入力フィールド */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredPosts.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder="記事を検索..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-200 placeholder-gray-500 text-gray-800"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('')
              setIsOpen(false)
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg 
              className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && filteredPosts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="py-2">
            <div className="px-4 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
              {filteredPosts.length}件の検索結果
            </div>
            {filteredPosts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug.current}`}
                onClick={handleResultClick}
                className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  {/* サムネイル */}
                  {post.youtubeUrl && getYouTubeThumbnailWithFallback(post.youtubeUrl) && (
                    <div className="flex-shrink-0 w-16 h-12 relative rounded overflow-hidden">
                      <Image
                        src={getYouTubeThumbnailWithFallback(post.youtubeUrl) || ''}
                        alt={`${post.title} - YouTube動画サムネイル`}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                        YT
                      </div>
                    </div>
                  )}
                  
                  {/* 記事情報 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                      {post.title}
                    </h3>
                    {post.categories && post.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {post.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    {post.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {post.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 検索中で結果がない場合 */}
      {isOpen && searchQuery && filteredPosts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="px-4 py-6 text-center text-gray-500">
            <svg 
              className="mx-auto h-8 w-8 text-gray-400 mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.094M6.343 6.343A8 8 0 1017.657 17.657 8 8 0 106.343 6.343z" 
              />
            </svg>
            <p className="text-sm">「{searchQuery}」の検索結果はありません</p>
          </div>
        </div>
      )}
    </div>
  )
}
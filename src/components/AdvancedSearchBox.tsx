'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Post } from '@/lib/sanity'
// import Link from 'next/link' // 現在未使用
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'

interface AdvancedSearchBoxProps {
  posts: Post[]
}

export default function AdvancedSearchBox({ posts }: AdvancedSearchBoxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 検索結果をマージし、重複を除去
  // const mergeSearchResults = (clientResults: Post[], serverResults: Post[]): Post[] => {
  //   const seen = new Set(clientResults.map(p => p._id))
  //   const uniqueServerResults = serverResults.filter(p => !seen.has(p._id))
  //   return [...clientResults, ...uniqueServerResults]
  // }

  // 検索実行関数
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredPosts([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      // クライアントサイドフィルタリング（リアルタイム用）
      const clientFiltered = posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description?.toLowerCase().includes(query.toLowerCase()) ||
        post.categories?.some(cat => cat.toLowerCase().includes(query.toLowerCase())) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)

      setFilteredPosts(clientFiltered)
      setIsOpen(clientFiltered.length > 0)
      setSelectedIndex(-1)
      
      // サーバーサイド検索は一時的に無効化（パフォーマンス改善のため）
      // 高速なクライアントサイドフィルタリングのみ使用
      console.log(`Advanced search: ${clientFiltered.length} results for "${query}"`)
    } catch (error) {
      console.error('Search error:', error)
      // フォールバック: クライアントサイドの結果を維持
    } finally {
      setIsLoading(false)
    }
  }

  // デバウンス処理付き検索
  const debouncedSearch = useCallback(
    (query: string) => debounce(performSearch, 300)(query),
    [posts]
  )

  // 検索クエリが変更された時の処理
  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredPosts.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredPosts.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && filteredPosts[selectedIndex]) {
          const selectedPost = filteredPosts[selectedIndex]
          console.log('Navigating via Enter key to:', selectedPost.slug.current)
          setIsOpen(false)
          setSelectedIndex(-1)
          router.push(`/blog/${selectedPost.slug.current}`)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // 結果項目のスクロール
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [selectedIndex])

  return (
    <div ref={searchRef} className="relative w-full z-[10000]">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="記事を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredPosts.length > 0) setIsOpen(true)
          }}
          className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          ) : (
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && filteredPosts.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[10001] max-h-96 overflow-y-auto w-screen max-w-7xl"
        >
          {filteredPosts.map((post, index) => (
            <div
              key={post._id}
              className={`cursor-pointer block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                console.log('Advanced search result clicked:', post.slug.current)
                setIsOpen(false)
                setSelectedIndex(-1)
                router.push(`/blog/${post.slug.current}`)
              }}
            >
              <div className="flex items-start gap-3">
                {post.youtubeUrl && getYouTubeThumbnailWithFallback(post.youtubeUrl) && (
                  <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={getYouTubeThumbnailWithFallback(post.youtubeUrl) || ''}
                      alt={`${post.title} サムネイル`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {highlightText(post.title, searchQuery)}
                  </h3>
                  {post.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {highlightText(post.description, searchQuery)}
                    </p>
                  )}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {post.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredPosts.length >= 8 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50">
              {searchQuery.length >= 2 ? 'より詳細な結果を取得中...' : 'さらに入力すると詳細な検索ができます'}
            </div>
          )}
        </div>
      )}

      {isOpen && filteredPosts.length === 0 && searchQuery.trim() && !isLoading && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[10001] p-4 text-center text-gray-500 w-screen max-w-7xl">
          「{searchQuery}」に関する記事が見つかりませんでした
        </div>
      )}
    </div>
  )
}

// テキストハイライト関数
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

// デバウンス関数
function debounce(
  func: (query: string) => Promise<void>,
  delay: number
): (query: string) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (query: string) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(query), delay)
  }
}
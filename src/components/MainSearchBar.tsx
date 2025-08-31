'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Post } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'

interface MainSearchBarProps {
  posts: Post[]
}

export default function MainSearchBar({ posts }: MainSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // 検索実行関数
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredPosts([])
      setIsSearchOpen(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      // クライアントサイドフィルタリング
      const clientFiltered = posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description?.toLowerCase().includes(query.toLowerCase()) ||
        post.categories?.some(cat => cat.toLowerCase().includes(query.toLowerCase())) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10)

      setFilteredPosts(clientFiltered)
      setIsSearchOpen(true)
      setSelectedIndex(-1)
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // デバウンス処理付き検索
  const debouncedSearch = useCallback(
    debounce(performSearch, 300),
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
        setIsSearchOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // キーボードナビゲーション
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen || filteredPosts.length === 0) return

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
          setIsSearchOpen(false)
          setSelectedIndex(-1)
          window.location.href = `/blog/${selectedPost.slug.current}`
        }
        break
      case 'Escape':
        setIsSearchOpen(false)
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
    <div className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={searchRef} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              name="search"
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filteredPosts.length > 0 || searchQuery.trim()) {
                  setIsSearchOpen(true)
                }
              }}
              className="w-full px-6 py-4 text-lg text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-all shadow-sm"
              data-testid="main-search-input"
              aria-label="記事を検索"
              aria-describedby="main-search-instructions"
              aria-expanded={isSearchOpen}
              aria-autocomplete="list"
              role="searchbox"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          <div id="main-search-instructions" className="sr-only">
            矢印キーで選択、Enterで決定、Escapeで閉じる
          </div>

          {/* 検索結果ドロップダウン */}
          {isSearchOpen && searchQuery.trim() && filteredPosts.length > 0 && (
            <div 
              ref={resultsRef}
              className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
              data-testid="main-search-results"
              role="listbox"
              aria-label={`${filteredPosts.length}件の検索結果`}
            >
              {filteredPosts.map((post, index) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className={`block px-6 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                  data-testid="main-search-result-item"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSelectedIndex(-1)
                  }}
                >
                  <div className="flex items-start gap-4">
                    {post.youtubeUrl && getYouTubeThumbnailWithFallback(post.youtubeUrl) && (
                      <div className="relative w-20 h-15 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={getYouTubeThumbnailWithFallback(post.youtubeUrl) || ''}
                          alt={`${post.title} サムネイル`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                        {highlightText(post.title, searchQuery)}
                      </h3>
                      {post.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {highlightText(post.description, searchQuery)}
                        </p>
                      )}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {post.categories.slice(0, 3).map((category) => (
                            <span
                              key={category}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              
              {filteredPosts.length >= 10 && (
                <div className="px-6 py-3 text-center text-sm text-gray-500 bg-gray-50">
                  {searchQuery.length >= 2 ? 'さらに詳細な検索が可能です' : 'より詳細に検索するには文字を追加してください'}
                </div>
              )}
            </div>
          )}

          {isSearchOpen && filteredPosts.length === 0 && searchQuery.trim() && !isLoading && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-6 text-center text-gray-500" data-testid="main-search-no-results">
              「{searchQuery}」に関する記事が見つかりませんでした
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// テキストハイライト関数
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
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
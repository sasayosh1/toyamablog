'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Post } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'

// SearchResultLink コンポーネント（Client Component）
interface SearchResultLinkProps {
  href: string
  className: string
  onResultClick: () => void
  children: React.ReactNode
}

function SearchResultLink({ href, className, onResultClick, children }: SearchResultLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={onResultClick}
    >
      {children}
    </Link>
  )
}

// MenuLink コンポーネント（Client Component）
interface MenuLinkProps {
  href: string
  className: string
  onMenuClick: () => void
  children: React.ReactNode
}

function MenuLink({ href, className, onMenuClick, children }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={onMenuClick}
    >
      {children}
    </Link>
  )
}

interface GlobalHeaderProps {
  posts: Post[]
  categories?: string[]
}

export default function GlobalHeader({ posts, categories = [] }: GlobalHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // 検索結果をマージし、重複を除去
  const mergeSearchResults = (clientResults: Post[], serverResults: Post[]): Post[] => {
    const seen = new Set(clientResults.map(p => p._id))
    const uniqueServerResults = serverResults.filter(p => !seen.has(p._id))
    return [...clientResults, ...uniqueServerResults]
  }

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
      // クライアントサイドフィルタリング（リアルタイム用）
      const clientFiltered = posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description?.toLowerCase().includes(query.toLowerCase()) ||
        post.categories?.some(cat => cat.toLowerCase().includes(query.toLowerCase())) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8)

      setFilteredPosts(clientFiltered)
      setIsSearchOpen(clientFiltered.length > 0)
      setSelectedIndex(-1)
      
      // サーバーサイド検索（より詳細な結果用）
      if (query.length >= 2) {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.posts && Array.isArray(data.posts)) {
              const mergedResults = mergeSearchResults(clientFiltered, data.posts)
              setFilteredPosts(mergedResults.slice(0, 10))
              setIsSearchOpen(mergedResults.length > 0)
            }
          }
        } catch (fetchError) {
          console.error('Search API fetch error:', fetchError)
        }
      }
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
          window.location.href = `/blog/${filteredPosts[selectedIndex].slug.current}`
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
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-lg backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PC用メニュー（lg以上で表示） */}
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* PCナビゲーション */}
          <nav className="flex items-center space-x-8">
            <Link href="/" className="font-medium transition-colors text-gray-800 hover:text-blue-600">
              ホーム
            </Link>
            <Link href="/categories" className="font-medium transition-colors text-gray-800 hover:text-blue-600">
              地域別カテゴリー
            </Link>
            <Link href="/about" className="font-medium transition-colors text-gray-800 hover:text-blue-600">
              サイトについて
            </Link>
          </nav>

          {/* PC用検索エリア */}
          <div ref={searchRef} className="relative max-w-md">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (filteredPosts.length > 0) setIsSearchOpen(true)
                }}
                className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* PC用検索結果ドロップダウン */}
            {isSearchOpen && filteredPosts.length > 0 && (
              <div 
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
              >
                {filteredPosts.map((post, index) => (
                  <SearchResultLink
                    key={post._id}
                    href={`/blog/${post.slug.current}`}
                    className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                    onResultClick={() => {
                      setIsSearchOpen(false)
                      setSelectedIndex(-1)
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
                  </SearchResultLink>
                ))}
                
                {filteredPosts.length >= 8 && (
                  <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50">
                    {searchQuery.length >= 2 ? 'より詳細な結果を取得中...' : 'さらに入力すると詳細な検索ができます'}
                  </div>
                )}
              </div>
            )}

            {isSearchOpen && filteredPosts.length === 0 && searchQuery.trim() && !isLoading && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-center text-gray-500">
                「{searchQuery}」に関する記事が見つかりませんでした
              </div>
            )}
          </div>
        </div>

        {/* モバイル用メニュー（lg未満で表示） */}
        <div className="lg:hidden flex items-center justify-between h-16">
          {/* ハンバーガーメニューボタン */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-8 h-8 focus:outline-none transition-colors text-gray-800 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* モバイル用検索エリア */}
          <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="記事を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (filteredPosts.length > 0) setIsSearchOpen(true)
                }}
                className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* モバイル用検索結果ドロップダウン */}
            {isSearchOpen && filteredPosts.length > 0 && (
              <div 
                ref={resultsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
              >
                {filteredPosts.map((post, index) => (
                  <SearchResultLink
                    key={post._id}
                    href={`/blog/${post.slug.current}`}
                    className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                    onResultClick={() => {
                      setIsSearchOpen(false)
                      setSelectedIndex(-1)
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
                  </SearchResultLink>
                ))}
                
                {filteredPosts.length >= 8 && (
                  <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50">
                    {searchQuery.length >= 2 ? 'より詳細な結果を取得中...' : 'さらに入力すると詳細な検索ができます'}
                  </div>
                )}
              </div>
            )}

            {isSearchOpen && filteredPosts.length === 0 && searchQuery.trim() && !isLoading && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 text-center text-gray-500">
                「{searchQuery}」に関する記事が見つかりませんでした
              </div>
            )}
          </div>

          {/* 右側の余白 */}
          <div className="w-8"></div>
        </div>
      </div>

      {/* モバイル用ハンバーガーメニュー */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col space-y-3">
              <MenuLink
                href="/"
                className="flex items-center px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                onMenuClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                ホーム
              </MenuLink>
              <MenuLink
                href="/categories"
                className="flex items-center px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                onMenuClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                地域別カテゴリー
              </MenuLink>
              <MenuLink
                href="/about"
                className="flex items-center px-3 py-2 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                onMenuClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                サイトについて
              </MenuLink>
              
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

// テキストハイライト関数
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi')
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
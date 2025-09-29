'use client'

import { useState, useEffect, useMemo } from 'react'
import { client } from '@/lib/sanity'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  category?: string
  tags?: string[]
  publishedAt: string
  youtubeUrl?: string
}

export default function SearchPage() {
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  // 全記事データを取得
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await client.fetch(`
          *[_type == "post" && defined(slug.current)] {
            _id,
            title,
            slug,
            excerpt,
            "category": category->title,
            tags,
            publishedAt,
            youtubeUrl
          } | order(publishedAt desc)
        `)
        setPosts(allPosts)
      } catch (error) {
        console.error('記事の取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // 検索結果をフィルタリング
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    setSearching(true)

    const query = searchQuery.toLowerCase().trim()
    const results = posts.filter(post => {
      // タイトル検索
      if (post.title.toLowerCase().includes(query)) return true

      // 説明文検索
      if (post.excerpt?.toLowerCase().includes(query)) return true

      // カテゴリ検索
      if (post.category?.toLowerCase().includes(query)) return true

      // タグ検索
      if (post.tags?.some(tag => tag.toLowerCase().includes(query))) return true

      return false
    })

    setTimeout(() => setSearching(false), 100)
    return results
  }, [posts, searchQuery])

  const breadcrumbItems = [
    { label: 'ホーム', href: '/' },
    { label: '検索', href: '/search' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader posts={posts} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">記事検索</h1>
          <p className="text-gray-600">
            記事のタイトル、内容、カテゴリ、タグから検索できます
          </p>
        </div>

        {/* 検索ボックス */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="記事を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoComplete="off"
            />
          </div>

          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              {searching ? (
                '検索中...'
              ) : (
                `「${searchQuery}」の検索結果: ${searchResults.length}件`
              )}
            </div>
          )}
        </div>

        {/* 検索結果 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">記事を読み込み中...</p>
          </div>
        ) : searchQuery ? (
          searchResults.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm">
              {searchResults.map((post) => {
                // タイトルから#shortsを削除
                const cleanTitle = post.title.replace(/\s*#shorts\s*/gi, '').trim()

                // YouTubeバッジ
                const hasYoutube = !!post.youtubeUrl

                return (
                  <article key={post._id} className="py-4 px-6 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <time className="text-sm text-gray-500" dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                      </time>
                      {hasYoutube && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          YouTube
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.slug.current}`} className="block">
                        {cleanTitle}
                      </Link>
                    </h2>
                    {post.category && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-blue-600 font-medium">
                          {post.category}
                        </span>
                      </div>
                    )}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/blog/${post.slug.current}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        続きを読む →
                      </Link>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-500"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">検索結果が見つかりません</h3>
              <p className="mt-1 text-sm text-gray-500">
                別のキーワードで検索してみてください
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">検索キーワードを入力してください</h3>
            <p className="mt-1 text-sm text-gray-500">
              記事のタイトルや内容から検索できます
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
import { getAllPosts, getAllCategories, type Post } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import GlobalHeader from '@/components/GlobalHeader'
import { getYouTubeThumbnailWithFallback } from '@/lib/youtube'
import { Metadata } from 'next'

// キャッシュ無効化: 常に最新を表示
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  
  return {
    title: `${decodedCategory} - TOYAMA BLOG`,
    description: `富山県の${decodedCategory}に関する記事一覧。YouTube Shortsと連携した地域情報をお届けします。`,
    openGraph: {
      title: `${decodedCategory} - TOYAMA BLOG`,
      description: `富山県の${decodedCategory}に関する記事一覧`,
      type: 'website',
      url: `https://sasakiyoshimasa.com/category/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  
  // 全記事と全カテゴリーを取得
  const [allPosts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories()
  ])
  
  // 該当カテゴリーの記事をフィルター
  const categoryPosts = allPosts.filter(post => post.category === decodedCategory)
  
  if (categoryPosts.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader posts={allPosts} categories={categories} />
      
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
        {/* パンくずナビゲーション */}
        <nav className="mb-6" aria-label="パンくず">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              ホーム
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/categories" className="hover:text-blue-600 transition-colors">
              カテゴリー
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{decodedCategory}</span>
          </div>
        </nav>

        {/* ページヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-white/20 rounded-lg p-2 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {decodedCategory}
              </h1>
              <p className="text-blue-100 text-lg">
                {categoryPosts.length}件の記事があります
              </p>
            </div>
          </div>
        </div>

        {/* 記事一覧 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categoryPosts.map((post) => (
            <Link 
              key={post._id} 
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
                        <span
                          key={category}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  {post.excerpt && (
                    <p className="text-gray-800 text-sm line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ナビゲーションボタン */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            カテゴリー一覧に戻る
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            ホームに戻る
          </Link>
        </div>

        {/* 他のカテゴリーへのリンク */}
        {categories.length > 1 && (
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              他のカテゴリーも見る
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories
                .filter(cat => cat !== decodedCategory)
                .slice(0, 8)
                .map((otherCategory) => {
                  const count = allPosts.filter(post => post.category === otherCategory).length
                  return (
                    <Link
                      key={otherCategory}
                      href={`/category/${encodeURIComponent(otherCategory)}`}
                      className="group block p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all border border-gray-100 hover:border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                          {otherCategory}
                        </span>
                        <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                          {count}
                        </span>
                      </div>
                    </Link>
                  )
                })}
            </div>
            {categories.length > 9 && (
              <div className="text-center mt-6">
                <Link
                  href="/categories"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  すべてのカテゴリーを見る
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
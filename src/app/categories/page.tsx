import { getAllCategories, getAllPosts } from '@/lib/sanity'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoriesPage() {
  const [categories, posts] = await Promise.all([
    getAllCategories(),
    getAllPosts()
  ])
  
  // 各カテゴリーの記事数を計算
  const categoriesWithCounts = categories.map(category => {
    const count = posts.filter(post => 
      post.categories?.includes(category) || post.category === category
    ).length
    return { name: category, count }
  }).sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader posts={posts} categories={categories} />
      
      {/* ヒーロセクション */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            カテゴリー
          </h1>
          <p className="text-xl text-green-100">
            興味のあるカテゴリーから記事を探してみてください
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4">
        {categoriesWithCounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-gray-600 text-lg">カテゴリーが見つかりませんでした</p>
            </div>
          </div>
        ) : (
          <>
            {/* カテゴリー統計 */}
            <div className="mb-8 text-center">
              <p className="text-gray-800 text-lg">
                全 <span className="font-bold text-green-600">{categoriesWithCounts.length}</span> カテゴリー・
                <span className="font-bold text-blue-600">{posts.length}</span> 記事
              </p>
            </div>

            {/* カテゴリーグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoriesWithCounts.map((category) => (
                <Link 
                  key={category.name}
                  href={`/category/${encodeURIComponent(category.name)}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:bg-green-50 transition-all duration-200 border border-gray-200 group-hover:border-green-300 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium group-hover:bg-green-200">
                        {category.count}記事
                      </span>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors mb-3 line-clamp-2">
                      {category.name}
                    </h2>
                    
                    <div className="flex items-center text-green-600 group-hover:text-green-700 transition-colors">
                      <span className="text-sm font-medium">記事を見る</span>
                      <svg 
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
        
        {/* ナビゲーション */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
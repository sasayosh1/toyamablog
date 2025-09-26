import { getAllPosts, client } from '@/lib/sanity'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'
import CategoryCard from '@/components/ui/CategoryCard'
import PageHeader from '@/components/ui/PageHeader'

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata = {
  title: '地域別カテゴリー | 富山のくせに',
  description: '富山県の各地域から記事を探すことができます。市町村別に整理された地域別カテゴリーページです。',
}

export default async function CategoriesPage() {
  // カテゴリーページでは最新データを強制取得（キャッシュ無効化）
  const [allCategories, posts] = await Promise.all([
    client.fetch<string[]>(`
      array::unique(*[_type == "post" && defined(category) && category != "グルメ" && category != "自然・公園"].category) | order(@)
    `, {}, { 
      next: { revalidate, tags: ['category-list'] },
    }),
    getAllPosts({ fetchAll: true, revalidate }),
  ])
  
  // 地域名のみを抽出（地域名以外のカテゴリーを除外）
  const locationCategories = [
    '富山市', '高岡市', '魚津市', '氷見市', '滑川市', '黒部市', '砺波市', '小矢部市', '南砺市', '射水市',
    '舟橋村', '上市町', '立山町', '入善町', '朝日町', '南砺市福野', '南砺市城端', '南砺市福光',
    '高岡市福岡町', '砺波市庄川', '富山市八尾町', '富山市婦中町', '富山市山田村',
    '八尾町', '福岡町', '庄川町'
  ]
  const categories = allCategories.filter(category => 
    locationCategories.includes(category) || 
    category.includes('市') || 
    category.includes('町') || 
    category.includes('村')
  ).filter(category => 
    category !== 'グルメ' && 
    category !== '自然・公園' && 
    category !== '観光' && 
    category !== 'イベント' && 
    category !== '文化・歴史'
  )
  
  // 各カテゴリーの記事数を計算
  const categoriesWithCounts = categories.map(category => {
    const count = posts.filter(post => 
      post.categories?.includes(category) || post.category === category
    ).length
    return { name: category, count }
  }).sort((a, b) => b.count - a.count)

  const categoryIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v2a3 3 0 003 3h12a3 3 0 003-3V7M3 7V5a1 1 0 011-1h5l2 2h8a1 1 0 011 1v2M3 7h18M12 12v6" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50 categories-page">
      <GlobalHeader posts={posts} categories={categories} />
      
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 pt-24">
        <PageHeader
          title="地域別カテゴリー"
          subtitle="興味のある地域から記事を探してみてください"
          icon={categoryIcon}
          gradient="green"
        />

        {categoriesWithCounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {categoryIcon}
              <p className="text-gray-600 text-lg">地域別カテゴリーが見つかりませんでした</p>
            </div>
          </div>
        ) : (
          <>
            {/* カテゴリー統計 */}
            <div className="mb-8 text-center">
              <p className="text-gray-800 text-lg">
                全 <span className="font-bold text-green-600">{categoriesWithCounts.length}</span> 地域・
                <span className="font-bold text-blue-600">{posts.length}</span> 記事
              </p>
            </div>

            {/* カテゴリーグリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoriesWithCounts.map((category) => (
                <CategoryCard
                  key={category.name}
                  name={category.name}
                  count={category.count}
                  href={`/category/${encodeURIComponent(category.name)}`}
                />
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

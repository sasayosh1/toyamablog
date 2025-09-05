import { getAllCategories, getPostsPaginated, getAllPosts } from '@/lib/sanity'
import GlobalHeader from '@/components/GlobalHeader'
import PostCard from '@/components/ui/PostCard'
import StructuredData from '@/components/StructuredData'
import { generateOrganizationLD, generateWebSiteLD } from '@/lib/structured-data'
import { getHeroImageUrl } from '@/lib/image-utils'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// 動的インポートでパフォーマンス向上
const MainSearchBar = dynamic(() => import('@/components/MainSearchBar'), {
  loading: () => <div className="bg-gray-50 py-6 h-20 animate-pulse" />
})
const Pagination = dynamic(() => import('@/components/ui/Pagination'), {
  loading: () => <div className="h-12 animate-pulse bg-gray-100 rounded" />
})

// ISR: 5分キャッシュでパフォーマンス向上
export const revalidate = 300

// メタデータ最適化
export const metadata = {
  title: '富山のくせに - AMAZING TOYAMA',
  description: '富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ',
  keywords: '富山, 観光, グルメ, YouTube, Shorts, 富山県',
  openGraph: {
    title: '富山のくせに - AMAZING TOYAMA',
    description: '富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '富山のくせに - AMAZING TOYAMA',
    description: '富山県の観光スポット、グルメ情報、文化を紹介',
  },
}

// ヒーロー画像コンポーネント
function HeroImage() {
  return (
    <img
      src="/images/toyama-hero.png"
      alt="富山市の風景 - 立山連峰を背景にした橋と川"
      className="w-full h-full object-cover object-center brightness-110 contrast-105"
      loading="eager"
    />
  )
}

interface Props {
  searchParams?: Promise<{ page?: string }>
}

export default async function Home({ 
  searchParams 
}: Props) {
  const params = searchParams ? await searchParams : {}
  const currentPage = parseInt(params?.page || '1', 10)
  
  // ページネーション対応で記事を取得、検索用には全記事を取得
  const [paginatedData, allPosts, categories] = await Promise.all([
    getPostsPaginated(currentPage, 51),
    getAllPosts(),
    getAllCategories()
  ])

  const { posts, totalPosts, totalPages, currentPage: page } = paginatedData

  // 構造化データを生成
  const organizationLD = generateOrganizationLD()
  const websiteLD = generateWebSiteLD()

  return (
    <>
      <StructuredData data={[organizationLD, websiteLD]} />
      <div className="min-h-screen bg-gray-50 blog-page">
        <GlobalHeader posts={allPosts} categories={categories} />
      <div className="relative h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <HeroImage />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/15 to-black/20" />
        
        {/* ヒーローセクション タイトル */}
        <div className="absolute inset-0 flex items-center justify-center md:justify-start">
          <div className="md:ml-20 lg:ml-24 xl:ml-28 px-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg">
              <h1 className="text-white font-bold text-center md:text-left leading-tight">
                <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl mb-1 sm:mb-2 drop-shadow-lg">
                  富山のくせに
                </div>
                <div className="text-xs sm:text-sm md:text-lg lg:text-xl font-medium drop-shadow-md">
                  AMAZING TOYAMA
                </div>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* プロモーション表示 - ヒーロー直下配置 */} {/* 修正 */}
      <div className="bg-white py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-base font-medium text-gray-800 leading-relaxed">
            ※本サイトで紹介している商品・サービス等の外部リンクには、プロモーションが含まれています。
          </p>
        </div>
      </div>

      {/* メイン検索バー */}
      <MainSearchBar posts={allPosts} />

      <main className="max-w-7xl mx-auto py-8 md:py-12 px-4 relative z-0">
        <section aria-labelledby="latest-articles-heading">
          <h2 id="latest-articles-heading" className="sr-only">最新記事一覧</h2>
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {posts.map((post, index) => (
              <PostCard 
                key={post._id} 
                post={post} 
                priority={index < 3}
              />
            ))}
          </div>
        </Suspense>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg">まだ投稿がありません</p>
          </div>
        )}

        {/* ページネーション */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/"
        />

        {/* 記事統計表示 */}
        <div className="text-center text-gray-600 text-sm mt-8">
          全 {totalPosts} 件中 {((page - 1) * 51) + 1} - {Math.min(page * 51, totalPosts)} 件を表示
        </div>
        </section>
      </main>
      </div>
    </>
  )
}

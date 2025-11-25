import { getAllCategories, getPostsPaginated, getAllPosts } from '@/lib/sanity'
import GlobalHeader from '@/components/GlobalHeader'
import PostCard from '@/components/ui/PostCard'
import StructuredData from '@/components/StructuredData'
import { generateOrganizationLD, generateWebSiteLD } from '@/lib/structured-data'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

// 動的インポートでパフォーマンス向上
const MainSearchBar = dynamic(() => import('@/components/MainSearchBar'), {
  loading: () => <div className="bg-gray-50 py-6 h-20 animate-pulse" />
})
const Pagination = dynamic(() => import('@/components/ui/Pagination'), {
  loading: () => <div className="h-12 animate-pulse bg-gray-100 rounded" />
})

// ISR: 5分キャッシュでパフォーマンス向上
export const revalidate = 300

interface SearchParams {
  page?: string
}

type PageProps = {
  params: Promise<Record<string, never>>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const currentPage = params?.page ? parseInt(params.page, 10) : 1
  const canonicalUrl = currentPage > 1
    ? `https://sasakiyoshimasa.com/?page=${currentPage}`
    : 'https://sasakiyoshimasa.com'

  return {
    title: currentPage > 1
      ? `富山、お好きですか？ - ページ ${currentPage}`
      : '富山、お好きですか？ - AMAZING TOYAMA',
    description: '富山県の観光スポットやグルメ、文化を紹介するYouTube Shorts連携ブログ。もっと富山を好きになるヒントをお届けします。',
    keywords: '富山, 観光, グルメ, YouTube, Shorts, 富山県',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: '富山、お好きですか？ - AMAZING TOYAMA',
      description: '富山県の観光スポットやグルメ、文化を紹介するYouTube Shorts連携ブログ。もっと富山を好きになるヒントをお届けします。',
      type: 'website',
      locale: 'ja_JP',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: '富山、お好きですか？ - AMAZING TOYAMA',
      description: '富山県の観光スポット、グルメ情報、文化を紹介',
    },
  }
}

// ヒーロー画像コンポーネント
function HeroImage() {
  return (
    <div className="absolute inset-0 z-0">
      <img
        src="/images/toyama-hero.png"
        alt="富山市の風景 - 立山連峰を背景にした橋と川"
        className="w-full h-full object-cover object-center scale-105 animate-fade-in"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
    </div>
  )
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
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

        {/* ヒーローセクション */}
        <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden flex items-end pb-12 md:pb-20">
          <HeroImage />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="mb-6 animate-fade-in delay-100">
                <h1 className="text-white font-bold leading-tight text-shadow-strong">
                  <span className="block text-xl md:text-2xl mb-2 tracking-widest opacity-90">AMAZING TOYAMA</span>
                  <span className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight whitespace-nowrap">
                    富山、お好きですか？
                  </span>
                </h1>
              </div>
              <p className="text-white text-lg md:text-xl font-medium text-shadow-medium max-w-2xl animate-fade-in delay-200">
                富山の美しい風景、美味しいグルメ、そして心温まる文化。
                <br className="hidden md:block" />
                あなただけの「好き」を見つける旅へ。
              </p>
            </div>
          </div>
        </div>

        {/* プロモーション表示 - 控えめに配置 */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <p className="text-xs text-gray-400 text-right">
              ※本サイトの記事にはプロモーションが含まれる場合があります
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

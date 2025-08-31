import { getAllPosts, getAllCategories } from '@/lib/sanity'
import Image from 'next/image'
import GlobalHeader from '@/components/GlobalHeader'
import MainSearchBar from '@/components/MainSearchBar'
import PostCard from '@/components/ui/PostCard'
import StructuredData from '@/components/StructuredData'
import { generateOrganizationLD, generateWebSiteLD } from '@/lib/structured-data'
import { Suspense } from 'react'

// ISR: 一覧は最長60秒で更新（モバイル読み込み速度向上） // 修正
export const revalidate = 60

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

export default async function Home() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories()
  ])

  // posts データ読み込み完了 // 修正

  // 構造化データを生成
  const organizationLD = generateOrganizationLD()
  const websiteLD = generateWebSiteLD()

  return (
    <>
      <StructuredData data={[organizationLD, websiteLD]} />
      <div className="min-h-screen bg-gray-50 blog-page">
        <GlobalHeader posts={posts} categories={categories} />
      <div className="relative h-80 md:h-96 lg:h-[32rem] overflow-hidden">
        <Image
          src="/images/toyama-hero.png"
          alt="富山市の風景 - 立山連峰を背景にした橋と川"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 drop-shadow-lg">
              富山のくせに
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-100 drop-shadow-md font-medium" role="doc-subtitle">
              AMAZING TOYAMA
            </p>
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
      <MainSearchBar posts={posts} />

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
        </section>
      </main>
      </div>
    </>
  )
}

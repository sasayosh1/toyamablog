import { getAllPosts, getAllCategories } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import PageHeader from '@/components/ui/PageHeader'
import PostCard from '@/components/ui/PostCard'
import CategoryCard from '@/components/ui/CategoryCard'
import StructuredData from '@/components/StructuredData'
import { generateCategoryLD, generateBreadcrumbLD } from '@/lib/structured-data'
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
    title: `${decodedCategory} - 富山のくせに`,
    description: `富山県の${decodedCategory}に関する記事一覧。YouTube Shortsと連携した地域情報をお届けします。`,
    openGraph: {
      title: `${decodedCategory} - 富山のくせに`,
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

  // 構造化データを生成
  const categoryLD = generateCategoryLD(decodedCategory, categoryPosts)
  const breadcrumbLD = generateBreadcrumbLD([
    { name: 'ホーム', url: 'https://sasakiyoshimasa.com/' },
    { name: 'カテゴリー', url: 'https://sasakiyoshimasa.com/categories' },
    { name: decodedCategory }
  ])

  return (
    <>
      <StructuredData data={[categoryLD, breadcrumbLD]} />
      <div className="min-h-screen bg-gray-50 category-page">
        <GlobalHeader posts={allPosts} categories={categories} />
      
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 pt-24">
        <Breadcrumb
          items={[
            {
              label: 'ホーム',
              href: '/',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )
            },
            {
              label: 'カテゴリー',
              href: '/categories'
            },
            {
              label: decodedCategory
            }
          ]}
        />

        <PageHeader
          title={decodedCategory}
          subtitle={`${categoryPosts.length}件の記事があります`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          gradient="blue"
        />

        {/* 記事一覧 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categoryPosts.map((post) => (
            <PostCard key={post._id} post={post} />
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
                    <CategoryCard
                      key={otherCategory}
                      name={otherCategory}
                      count={count}
                      href={`/category/${encodeURIComponent(otherCategory)}`}
                      variant="compact"
                    />
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
    </>
  )
}
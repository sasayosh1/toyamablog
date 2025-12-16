import { safeFetch, getAllPosts, getAllCategories } from '@/lib/sanity'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CategoryHero from '@/components/ui/CategoryHero'
import PostCard from '@/components/ui/PostCard'
import CategoryCard from '@/components/ui/CategoryCard'
import StructuredData from '@/components/StructuredData'
import { generateCategoryLD, generateBreadcrumbLD } from '@/lib/structured-data'
import { Metadata } from 'next'

// ISR: 1時間ごとに再検証
export const revalidate = 3600
export const dynamicParams = true

// 静的パスの生成
export async function generateStaticParams() {
  try {
    const categories = await getAllCategories()
    return categories.map((category) => ({
      category: encodeURIComponent(category),
    }))
  } catch (error) {
    console.error('Error generating static params for categories:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const canonical = `https://sasakiyoshimasa.com/category/${encodeURIComponent(decodedCategory)}`
  const postCountQuery =
    `count(*[_type == "post" && defined(publishedAt) && (category == $cat || $cat in categories[]->title)])` as const
  const postCount = await safeFetch<number>(postCountQuery, { cat: decodedCategory }, {}, 0)
  return {
    title: `${decodedCategory} - 富山、お好きですか？`,
    description: `富山県の${decodedCategory}に関する記事一覧。YouTube Shortsと連携した地域情報をお届けします。`,
    robots: postCount > 0 ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${decodedCategory} - 富山、お好きですか？`,
      description: `富山県の${decodedCategory}に関する記事一覧`,
      type: 'website',
      url: canonical,
    },
    alternates: {
      canonical
    }
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)

  // 全記事と全カテゴリーを取得（カテゴリーは最新データを強制取得）
  const [allPosts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories({ forceFresh: true })
  ])

  // 該当カテゴリーの記事をフィルター
  const categoryPosts = allPosts.filter(post =>
    post.category === decodedCategory ||
    post.categories?.includes(decodedCategory)
  )

  // 構造化データを生成
  const categoryLD = categoryPosts.length ? generateCategoryLD(decodedCategory, categoryPosts) : null
  const breadcrumbLD = generateBreadcrumbLD([
    { name: 'ホーム', url: 'https://sasakiyoshimasa.com/' },
    { name: 'カテゴリー', url: 'https://sasakiyoshimasa.com/categories' },
    { name: decodedCategory }
  ])

  return (
    <>
      <StructuredData data={[categoryLD, breadcrumbLD].filter(Boolean)} />
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

          <CategoryHero
            title={decodedCategory}
            subtitle={`${categoryPosts.length}件の記事があります`}
            description={`富山県の${decodedCategory}に関する記事一覧です。`}
          />

          {/* 記事一覧 */}
          {categoryPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {categoryPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    このカテゴリーの記事はまだ見つかりませんでした
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    しばらくしてから記事が追加される可能性があります。よければ他のカテゴリーも見てみてください。
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/categories"
                      className="inline-flex items-center justify-center px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                    >
                      カテゴリー一覧へ
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center px-5 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm border border-gray-300"
                    >
                      ホームに戻る
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

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
          {(() => {
            // 地域名のみを抽出（地域名以外のカテゴリーを除外）
            const locationCategories = [
              '富山市', '高岡市', '魚津市', '氷見市', '滑川市', '黒部市', '砺波市', '小矢部市', '南砺市', '射水市',
              '舟橋村', '上市町', '立山町', '入善町', '朝日町', '南砺市福野', '南砺市城端', '南砺市福光',
              '高岡市福岡町', '砺波市庄川', '富山市八尾町', '富山市婦中町', '富山市山田村',
              '八尾町', '福岡町', '庄川町'
            ]
            const filteredCategories = categories.filter(category =>
              locationCategories.includes(category) ||
              category.includes('市') ||
              category.includes('町') ||
              category.includes('村')
            ).filter(category =>
              category !== 'グルメ' &&
              category !== '自然・公園' &&
              category !== '観光' &&
              category !== 'イベント' &&
              category !== '文化・歴史' &&
              category !== decodedCategory
            )

            return filteredCategories.length > 0 && (
              <div className="mt-16 border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  他の地域も見る
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredCategories
                    .slice(0, 8)
                    .map((otherCategory) => {
                      const count = allPosts.filter(post =>
                        post.category === otherCategory ||
                        post.categories?.includes(otherCategory)
                      ).length
                      return count > 0 && (
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
              </div>
            )
          })()}
        </div>
      </div>
    </>
  )
}

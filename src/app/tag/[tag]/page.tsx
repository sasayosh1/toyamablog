import { client, safeFetch, type Post, getAllCategories, normalizePostCategoryList } from '@/lib/sanity'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'
import PostCard from '@/components/ui/PostCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import StructuredData from '@/components/StructuredData'
import { generateTagLD, generateBreadcrumbLD } from '@/lib/structured-data'
import type { Metadata } from 'next'

// キャッシュ無効化: 常に最新を表示
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  // タグで記事を検索
  const tagPostsQuery = `
    *[_type == "post" && defined(publishedAt) && $tag in tags] | order(publishedAt desc) {
      _id, title, slug, description, tags, category, publishedAt, youtubeUrl,
      author->{ _id, name, slug, bio, image{ asset->{ _ref, url } } },
      "excerpt": description, "categoryRefs": categories[]->title
    }
  ` as const

  const posts = normalizePostCategoryList(
    await safeFetch<(Post & { categoryRefs?: string[] | null })[]>(
      tagPostsQuery,
      { tag: decodedTag },
      {},
      []
    )
  )

  // 記事一覧とカテゴリーを取得（検索用）
  const [allPosts, categories] = await Promise.all([
    client.fetch<(Post & { categoryRefs?: string[] | null })[]>(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...100] {
        _id, title, slug, description, tags, category, publishedAt, youtubeUrl,
        author->{ _id, name, slug, bio, image{ asset->{ _ref, url } } },
        "excerpt": description, "categoryRefs": categories[]->title
      }
    `).then((results) => normalizePostCategoryList(results)),
    getAllCategories()
  ])

  // 構造化データを生成
  const tagLD = posts.length ? generateTagLD(decodedTag, posts) : null
  const breadcrumbLD = generateBreadcrumbLD([
    { name: 'ホーム', url: 'https://sasakiyoshimasa.com/' },
    { name: `タグ: ${decodedTag}` }
  ])

  return (
    <>
      <StructuredData data={[tagLD, breadcrumbLD].filter(Boolean)} />
      <div className="min-h-screen bg-gray-50">
        <GlobalHeader posts={allPosts} categories={categories} />
      
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
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
              label: `タグ: ${decodedTag}`
            }
          ]}
        />

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {decodedTag}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-2">
            「{decodedTag}」タグの記事一覧
          </p>
          <p className="text-gray-500">
            {posts.length}件の記事が見つかりました
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-12">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  このタグの記事はまだ見つかりませんでした
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  タグの表記ゆれ（例：全角/半角、表現の違い）で分かれている可能性があります。よければ検索やカテゴリーから探してみてください。
                </p>
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/categories"
                    className="inline-flex items-center justify-center px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-sm"
                  >
                    カテゴリーから探す
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

        {/* ナビゲーション */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </div>
      </div>
    </>
  )
}

// メタデータの生成
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const canonical = `https://sasakiyoshimasa.com/tag/${encodeURIComponent(decodedTag)}`

  const postCountQuery =
    `count(*[_type == "post" && defined(publishedAt) && $tag in tags])` as const
  const postCount = await safeFetch<number>(postCountQuery, { tag: decodedTag }, {}, 0)
  
  return {
    title: `${decodedTag} - タグ | 富山、お好きですか？`,
    description: `富山の魅力を紹介する「${decodedTag}」タグの記事一覧ページです。`,
    robots: postCount > 0 ? undefined : { index: false, follow: true },
    alternates: {
      canonical
    }
  }
}

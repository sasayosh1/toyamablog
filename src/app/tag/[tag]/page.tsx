import { client, type Post, getAllCategories, getAllPosts } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import GlobalHeader from '@/components/GlobalHeader'
import PostCard from '@/components/ui/PostCard'
import Breadcrumb from '@/components/ui/Breadcrumb'
import StructuredData from '@/components/StructuredData'
import { generateTagLD, generateBreadcrumbLD } from '@/lib/structured-data'

// キャッシュ無効化: 常に最新を表示
export const revalidate = 3600
export const dynamic = 'force-static'

interface SanityTag {
  tag: string;
}

// 静的パスを生成 - Sanity認証エラー回避のため一時的に無効化
export async function generateStaticParams() {
  // Sanity認証エラー回避のため一時的にコメントアウト
  // const posts = await client.fetch<{ tags: string[] }[]>(`
  //   *[_type == "post" && defined(publishedAt) && defined(tags)] {
  //     tags
  //   }
  // `);
  //
  // // すべてのタグを抽出して重複を除去
  // const allTags = posts.flatMap(post => post.tags || []);
  // const uniqueTags = [...new Set(allTags)];
  //
  // return uniqueTags.map((tag) => ({
  //   tag: encodeURIComponent(tag),
  // }));
  return []
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  // タグで記事を検索
  const posts = await client.fetch<Post[]>(`
    *[_type == "post" && defined(publishedAt) && "${decodedTag}" in tags] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      excerpt,
      category,
      publishedAt,
      youtubeUrl,
      author->{ _id, name, slug },
      thumbnail{ asset->{ _ref, url }, alt },
      tags,
      "categories": [category],
      "displayExcerpt": coalesce(excerpt, description)
    }
  `)

  if (posts.length === 0) {
    notFound()
  }

  // 記事一覧とカテゴリーを取得（検索用）
  const [allPosts, categories] = await Promise.all([
    getAllPosts({ fetchAll: true, revalidate }),
    getAllCategories(),
  ])

  // 構造化データを生成
  const tagLD = generateTagLD(decodedTag, posts)
  const breadcrumbLD = generateBreadcrumbLD([
    { name: 'ホーム', url: 'https://sasakiyoshimasa.com/' },
    { name: `タグ: ${decodedTag}` }
  ])

  return (
    <>
      <StructuredData data={[tagLD, breadcrumbLD]} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

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
export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  
  return {
    title: `${decodedTag} - タグ | 富山のくせに`,
    description: `富山の魅力を紹介する「${decodedTag}」タグの記事一覧ページです。`,
  }
}

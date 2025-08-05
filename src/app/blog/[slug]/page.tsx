import { getPost, getAllCategories, type Post, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PortableText from '@/components/PortableText'
import GlobalHeader from '@/components/GlobalHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ReadingTime from '@/components/ui/ReadingTime'
import NewTableOfContents from '@/components/NewTableOfContents'

// キャッシュ無効化: 常に最新を表示
export const revalidate = 0
export const dynamic = 'force-dynamic'

interface SanityPost {
  slug: string;
}

// 静的パスを生成
export async function generateStaticParams() {
  const posts = await client.fetch<SanityPost[]>(`*[_type == "post" && defined(publishedAt)]{ "slug": slug.current }`);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post: Post | null = await getPost(slug)

  if (!post) {
    notFound()
  }

  // 記事一覧とカテゴリーを取得（検索用）
  const [posts, categories] = await Promise.all([
    client.fetch<Post[]>(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...100] {
        _id, title, slug, description, tags, category, publishedAt, youtubeUrl,
        author->{ _id, name, slug, bio, image{ asset->{ _ref, url } } },
        "excerpt": description, "categories": [category]
      }
    `),
    getAllCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50 blog-page">
      <GlobalHeader posts={posts} categories={categories} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            ...(post.category ? [{
              label: post.category,
              href: `/category/${encodeURIComponent(post.category)}`
            }] : []),
            {
              label: post.title
            }
          ]}
        />

        <article className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 leading-tight">
            {post.title}
          </h1>
          
          {post.body && (
            <ReadingTime content={post.body as Array<{
              _type?: string
              style?: string
              children?: Array<{ text: string }>
              html?: string
            }>} />
          )}

        {post.youtubeUrl && (
          <div className="mb-8">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
              <iframe
                src={post.youtubeUrl.replace('youtube.com/shorts/', 'youtube.com/embed/').replace('https://youtube.com/shorts/', 'https://www.youtube.com/embed/')}
                title={post.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

          {post.category && (
            <div className="mb-6">
              <Link
                href={`/category/${encodeURIComponent(post.category)}`}
                className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md hover:bg-green-200 transition-colors"
              >
                {post.category}
              </Link>
            </div>
          )}

        {post.body ? (
          <>
            {/* 強制表示テスト用TOC */}
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-4 md:p-5 mb-6 md:mb-8 shadow-md">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800">もくじ</h3>
              </div>
              <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm">
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  もくじを表示
                </span>
              </button>
            </div>
            
            <div className="prose prose-lg max-w-none mb-12 blog-content">
              <PortableText value={post.body as unknown} />
            </div>
          </>
        ) : null}

          {post.tags && post.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">タグ</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ナビゲーションボタン */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {post.category && (
                <Link
                  href={`/category/${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {post.category}の記事一覧
                </Link>
              )}
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
          </div>
        </article>
      </div>
    </div>
  )
}

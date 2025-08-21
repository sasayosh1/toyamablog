import { getPost, getAllCategories, type Post, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PortableText from '@/components/PortableText'
import GlobalHeader from '@/components/GlobalHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ReadingTime from '@/components/ui/ReadingTime'
import TableOfContents from '@/components/TableOfContents'
import { TopArticleAd, MiddleArticleAd, BottomArticleAd } from '@/components/ArticleAds'

// ISR: 詳細ページは5分キャッシュ
export const revalidate = 300

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
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
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
          
          {Array.isArray(post.body) && post.body.length > 0 && (
            <ReadingTime content={post.body} />
          )}

        {post.youtubeUrl && (
          <div className="mb-8">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
              <iframe
                src={(() => {
                  // YouTube URL を embed形式に変換
                  const embedUrl = post.youtubeUrl;
                  
                  // youtu.be形式の変換
                  if (embedUrl.includes('youtu.be/')) {
                    const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
                    return `https://www.youtube.com/embed/${videoId}`;
                  }
                  
                  // youtube.com/watch形式の変換
                  if (embedUrl.includes('youtube.com/watch?v=')) {
                    const videoId = embedUrl.split('v=')[1]?.split('&')[0];
                    return `https://www.youtube.com/embed/${videoId}`;
                  }
                  
                  // youtube.com/shorts形式の変換
                  if (embedUrl.includes('youtube.com/shorts/')) {
                    const videoId = embedUrl.split('shorts/')[1]?.split('?')[0];
                    return `https://www.youtube.com/embed/${videoId}`;
                  }
                  
                  // 既にembed形式の場合はそのまま
                  if (embedUrl.includes('youtube.com/embed/')) {
                    return embedUrl;
                  }
                  
                  // その他の場合はそのまま返す
                  return embedUrl;
                })()}
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

          {/* 記事上部広告 */}
          <TopArticleAd />

        {post.body && Array.isArray(post.body) ? (
          <>
            <TableOfContents content={post.body} />
            <div className="prose prose-lg max-w-none mb-12 blog-content">
              <PortableText value={post.body} />
            </div>
            {/* 記事中央広告 */}
            <MiddleArticleAd />
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

          {/* 記事下部広告 */}
          <BottomArticleAd />

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

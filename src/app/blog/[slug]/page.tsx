import { getPost, getAllCategories, type Post, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PortableText from '@/components/PortableText'
import GlobalHeader from '@/components/GlobalHeader'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ReadingTime from '@/components/ui/ReadingTime'
import TableOfContents from '@/components/TableOfContents'
// import { TopArticleAd, MiddleArticleAd, BottomArticleAd } from '@/components/ArticleAds'
import StructuredData from '@/components/StructuredData'
import { generateArticleLD, generateBreadcrumbLD } from '@/lib/structured-data'
import ArticleErrorBoundary from '@/components/ui/ArticleErrorBoundary'
import type { Metadata } from 'next'
import { makeLodgingLink } from '@/lib/lodgingLink'
import { extractAreaFromTitle } from '@/lib/extractArea'

// ISR: 詳細ページは10分キャッシュ
export const revalidate = 600

// interface SanityPost {
//   slug: string;
// }

// 静的パスを生成 - 一時的に無効化してビルドエラーを回避
export async function generateStaticParams() {
  // Sanity認証エラー回避のため一時的にコメントアウト
  // const posts = await client.fetch<SanityPost[]>(`*[_type == "post" && defined(publishedAt)]{ "slug": slug.current }`);
  // return posts.map((post) => ({
  //   slug: post.slug,
  // }));
  return [];
}

// メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'ページが見つかりません',
      description: 'お探しのページは見つかりませんでした。'
    }
  }
  
  // タイトルから#shortsを削除（クラウドルール準拠）
  const cleanTitle = post.title.replace(/\s*#shorts\s*/gi, '').trim();
  
  // サムネイル画像URLを取得
  const thumbnailUrl = post.youtubeUrl 
    ? `https://img.youtube.com/vi/${post.youtubeUrl.split('/').pop()}/maxresdefault.jpg`
    : post.thumbnail?.asset?.url || '/images/og-image.png'
  
  const publishedTime = post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined
  const modifiedTime = publishedTime
  
  return {
    title: cleanTitle,
    description: post.excerpt || post.description || `${cleanTitle}の詳細情報を紹介しています。`,
    keywords: post.tags || [post.category || '富山'],
    authors: [{ name: 'ささよし', url: 'https://sasakiyoshimasa.com' }],
    openGraph: {
      title: cleanTitle,
      description: post.excerpt || post.description || `${cleanTitle}の詳細情報を紹介しています。`,
      url: `https://sasakiyoshimasa.com/blog/${slug}`,
      siteName: '富山のくせに',
      images: [{
        url: thumbnailUrl,
        width: 1200,
        height: 630,
        alt: cleanTitle
      }],
      locale: 'ja_JP',
      type: 'article',
      publishedTime,
      modifiedTime,
      section: post.category || '富山',
      tags: post.tags || [post.category || '富山'],
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: post.excerpt || post.description || `${cleanTitle}の詳細情報を紹介しています。`,
      site: '@sasayoshi_tym',
      creator: '@sasayoshi_tym',
      images: [thumbnailUrl],
    },
    alternates: {
      canonical: `https://sasakiyoshimasa.com/blog/${slug}`,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post: Post | null = await getPost(slug)

  if (!post) {
    notFound()
  }

  // タイトルから#shortsを削除
  const cleanTitle = post.title.replace(/\s*#shorts\s*/gi, '').trim();

  // 軽量化：検索用データのみ取得
  const [posts, categories, relatedPosts] = await Promise.all([
    client.fetch<Post[]>(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...50] {
        _id, title, slug, category, publishedAt,
        "categories": [category]
      }
    `, {}, {
      next: {
        tags: ['search-posts'],
        revalidate: 600
      }
    }),
    getAllCategories(),
    // 関連記事取得（同じカテゴリの記事を2件）
    client.fetch<Post[]>(`
      *[_type == "post" && category == $category && _id != $postId && defined(slug.current)]
      | order(publishedAt desc) [0...2] {
        title,
        slug
      }
    `, { category: post.category, postId: post._id }, {
      next: { tags: ['related-posts'], revalidate: 600 }
    })
  ])

  // 構造化データを生成
  const articleLD = generateArticleLD(post, slug)
  const breadcrumbLD = generateBreadcrumbLD([
    { name: 'ホーム', url: 'https://sasakiyoshimasa.com/' },
    ...(post.category ? [{ name: post.category, url: `https://sasakiyoshimasa.com/category/${encodeURIComponent(post.category)}` }] : []),
    { name: cleanTitle }
  ])

  return (
    <>
      <StructuredData data={[articleLD, breadcrumbLD]} />
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
              label: cleanTitle
            }
          ]}
        />

        <ArticleErrorBoundary articleTitle={cleanTitle}>
          <article className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900 leading-tight">
              {cleanTitle}
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
                title={cleanTitle}
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

          {/* 記事上部広告 - 一時的に無効化（スロットID未設定のため） */}
          {/* <TopArticleAd /> */}

        {post.body && Array.isArray(post.body) ? (
          <>
            <TableOfContents content={post.body} />
            <div className="prose prose-lg max-w-none mb-12 blog-content">
              <PortableText value={post.body} />
            </div>
            {/* 記事中央広告 - 一時的に無効化（スロットID未設定のため） */}
            {/* <MiddleArticleAd /> */}
          </>
        ) : null}

        <>

        {/* Googleマップセクション */}
        {(() => {
          // タイトルから地域名を抽出
          const area = extractAreaFromTitle(cleanTitle, { fallback: '' });

          if (!area) return null;

          // Google Maps Embed API URL
          const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=富山県${encodeURIComponent(area)}`;

          return (
            <div className="mb-12 border-t border-gray-200 pt-8">
              {/* Googleマップ */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          );
        })()}

        {/* 宿泊リンクセクション（Googleマップ直後） */}
        {(() => {
          // タイトルから地域名を抽出
          const area = extractAreaFromTitle(cleanTitle, { fallback: '' });

          if (!area) return null;

          // 宿泊リンクを生成
          const lodgingLink = makeLodgingLink({ area });

          return (
            <div className="mb-12 border-t border-gray-200 pt-8">
              <div className="lodging-link-block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm">
                <p className="text-lg font-medium text-gray-800 mb-3">
                  📍{area}の宿泊先を探している方はこちら
                </p>
                <a
                  href={lodgingLink.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <span className="mr-2">👉</span>
                  {lodgingLink.label}で宿泊プランをチェックする
                </a>
              </div>
            </div>
          );
        })()}

        {/* 記事下部広告 - 一時的に無効化（スロットID未設定のため） */}
        {/* <BottomArticleAd /> */}

        {/* 関連記事セクション */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">関連記事</h3>
            <div className="space-y-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug.current}
                  href={`/blog/${relatedPost.slug.current}`}
                  className="block text-blue-600 hover:text-blue-800 hover:underline"
                >
                  ・{relatedPost.title.replace(/\s*#shorts\s*/gi, '').trim()}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* タグセクション */}
        {post.tags && post.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-8 mb-8">
            <div className="flex flex-wrap gap-2">
              {post.tags
                .filter((tag): tag is string => typeof tag === 'string' && tag.trim() !== '')
                .map((tag) => (
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
        </>
        </article>
        </ArticleErrorBoundary>
      </div>
      </div>
    </>
  )
}

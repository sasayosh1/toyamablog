import { getPost, type Post, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import PortableText from '@/components/PortableText'
import GlobalHeader from '@/components/GlobalHeader'

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

  // 記事一覧を取得（検索用）
  const posts = await client.fetch<Post[]>(`
    *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...100] {
      _id, title, slug, description, tags, category, publishedAt, youtubeUrl,
      author->{ _id, name, slug, bio, image{ asset->{ _ref, url } } },
      "excerpt": description, "categories": [category]
    }
  `)

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader posts={posts} />
      <article className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-gray-900 leading-tight">
          {post.title}
        </h1>
      

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
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md">
              {post.category}
            </span>
          </div>
        )}

        {post.body ? (
          <div className="prose prose-lg max-w-none mb-12 blog-content">
            <PortableText value={post.body as unknown} />
          </div>
        ) : null}

        {post.tags && post.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">タグ</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}

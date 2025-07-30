import { getPost, type Post, client } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import PortableText from '@/components/PortableText'

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

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        {post.title}
      </h1>
      
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {post.author?.image?.asset?.url ? (
            <img 
              src={post.author.image.asset.url}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900">{post.author?.name || 'Unknown Author'}</div>
            {post.author?.bio && (
              <div className="text-sm text-gray-600">{post.author.bio.substring(0, 100)}...</div>
            )}
          </div>
        </div>
        <time className="text-sm text-gray-500" dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          })}
        </time>
      </div>

      {post.youtubeUrl && (
        <div className="mb-8">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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

      {post.tags && post.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {post.body ? (
        <div style={{ lineHeight: '1.7', fontSize: '1.125rem' }}>
          <PortableText value={post.body as unknown} />
        </div>
      ) : null}
    </article>
  )
}

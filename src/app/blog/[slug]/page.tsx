import { client } from '@/lib/sanity'
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

interface Post {
  title: string
  body?: any
  publishedAt?: string
  author?: {
    name: string
  }
  mainImage?: any
  // 他のフィールドも必要に応じて追加
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch<Post>(
    `*[_type == "post" && slug.current == $slug && defined(publishedAt)][0]{ 
      title, 
      body, 
      publishedAt, 
      mainImage,
      "author": author->name 
    }`,
    { slug }
  )

  if (!post) {
    notFound()
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        {post.title}
      </h1>
      
      <div style={{ marginBottom: '2rem', color: '#666', fontSize: '0.875rem' }}>
        {post.author && <span>著者: {post.author}</span>}
        {post.author && post.publishedAt && <span> • </span>}
        {post.publishedAt && (
          <span>公開日: {new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>
        )}
      </div>

      {post.mainImage && (
        <div style={{ marginBottom: '2rem' }}>
          <img
            src={post.mainImage.asset?.url || ''}
            alt={post.mainImage.alt || post.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      )}

      {post.body && (
        <div style={{ lineHeight: '1.7', fontSize: '1.125rem' }}>
          <PortableText value={post.body} />
        </div>
      )}
    </article>
  )
}

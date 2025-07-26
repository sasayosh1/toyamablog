import { client } from '@/lib/sanity'
import { notFound } from 'next/navigation'

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
  // 他のフィールドも必要に応じて追加
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await client.fetch<Post>(
    `*[_type == "post" && slug.current == $slug && defined(publishedAt)][0]{ title, body, publishedAt, "author": author->name }`,
    { slug }
  )

  if (!post) {
    notFound()
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{post.title}</h1>
      {post.author && (
        <p style={{ color: '#666', marginBottom: '1rem' }}>著者: {post.author}</p>
      )}
      {post.publishedAt && (
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          公開日: {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
        </p>
      )}
      {post.body && (
        <div style={{ lineHeight: '1.6' }}>
          {/* ここに記事の本文を表示（PortableTextコンポーネントが必要） */}
          <p>記事の本文がここに表示されます</p>
        </div>
      )}
    </article>
  )
}

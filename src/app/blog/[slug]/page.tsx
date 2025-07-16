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
  // 他のフィールドも必要に応じて追加
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch<Post>(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug: params.slug }
  )

  if (!post) {
    notFound()
  }

  return (
    <article>
      <h1>{post.title}</h1>
      {/* ここに記事の本文などを表示 */}
    </article>
  )
}

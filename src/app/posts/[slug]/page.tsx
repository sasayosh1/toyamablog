import { getPost, getAllPosts } from '@/lib/sanity'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import PortableText from '@/components/PortableText'
import TableOfContents from '@/components/TableOfContents'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug.current,
  }))
}

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 blog-page">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            {post.title}
          </h1>
          <p className="text-blue-100 mt-2">
            {format(new Date(post.publishedAt), 'yyyy年MM月dd日', { locale: ja })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4">
        <article className="bg-white rounded-lg shadow-md p-8">
          {post.categories && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          
          {post.body && Array.isArray(post.body) ? (
            <TableOfContents content={post.body} />
          ) : null}
          
          <div className="prose prose-lg max-w-none">
            {post.body && Array.isArray(post.body) ? (
              <PortableText value={post.body} />
            ) : null}
          </div>
        </article>
      </div>
    </div>
  )
}
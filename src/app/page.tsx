import { getAllPosts } from '@/lib/sanity'
import Link from 'next/link'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function Home() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            TOYAMA BLOG
          </h1>
          <p className="text-xl text-blue-100">
            富山県の魅力を発信するブログ
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post._id} href={`/posts/${post.slug.current}`}>
              <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-blue-600">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {format(new Date(post.publishedAt), 'yyyy年MM月dd日', { locale: ja })}
                  </p>
                  {post.categories && (
                    <div className="flex flex-wrap gap-2">
                      {post.categories.map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
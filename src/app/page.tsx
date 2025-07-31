import { getAllPosts, type Post } from '@/lib/sanity'
import Link from 'next/link'

// ISR: 5分間隔で再検証（一覧ページ）
export const revalidate = 300

export default async function Home() {
  const posts: Post[] = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            TOYAMA BLOG
          </h1>
          <p className="text-xl text-blue-100">
            富山の魅力を発信するブログサイトです
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-800 line-clamp-2">
                  {post.title}
                </h2>
                
                {post.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.slice(0, 3).map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    {post.author?.image?.asset?.url ? (
                      <img 
                        src={post.author.image.asset.url}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {post.author?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="font-medium">{post.author?.name || 'Unknown'}</span>
                  </div>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>

                {post.excerpt && (
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}

                <Link
                  href={`/blog/${post.slug.current}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  続きを読む
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">まだ投稿がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

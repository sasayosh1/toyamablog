import { getAllPosts, type Post } from '@/lib/sanity'
import Link from 'next/link'
import Image from 'next/image'

// ISR: 5分間隔で再検証（一覧ページ）
export const revalidate = 300

export default async function Home() {
  const posts: Post[] = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <Image
          src="/images/toyama-hero.png"
          alt="富山市の風景 - 立山連峰を背景にした橋と川"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 drop-shadow-lg">
              TOYAMA BLOG
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-100 drop-shadow-md">
              富山の美しい風景と魅力を発信
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post) => (
            <Link 
              key={post._id} 
              href={`/blog/${post.slug.current}`}
              className="block"
            >
              <article className="bg-white rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer">
                <div className="p-5 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 text-gray-800 line-clamp-2 leading-tight">
                    {post.title}
                  </h2>
                  
                  {post.categories && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.categories.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  {post.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </Link>
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

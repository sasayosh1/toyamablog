import { getAllPosts, getAllCategories } from '@/lib/sanity'
import Image from 'next/image'
import GlobalHeader from '@/components/GlobalHeader'
import PostCard from '@/components/ui/PostCard'

// ISR: 一覧は最長60秒で更新
export const revalidate = 60

export default async function Home() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50 blog-page">
      <GlobalHeader posts={posts} categories={categories} />
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 drop-shadow-lg">
              富山のくせに
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-100 drop-shadow-md mb-3 md:mb-4 font-medium">
              AMAZING TOYAMA
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-200 drop-shadow-md">
              富山の「くせに」すごい魅力を発信
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 relative z-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg">まだ投稿がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

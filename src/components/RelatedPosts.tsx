import { getRelatedPosts, type Post } from '@/lib/sanity'
import PostCard from './ui/PostCard'

interface RelatedPostsProps {
  currentPostId: string
  category?: string
  limit?: number
}

export default async function RelatedPosts({
  currentPostId,
  category,
  limit = 6
}: RelatedPostsProps) {
  const relatedPosts = await getRelatedPosts(currentPostId, category, limit)

  if (!relatedPosts || relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="my-12 py-8 bg-gray-50 rounded-lg">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
          {category ? `${category}の関連記事` : '関連記事'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </section>
  )
}

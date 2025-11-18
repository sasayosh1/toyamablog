import Link from 'next/link'
import type { Post } from '@/lib/sanity'

type SeriesNavigatorProps = {
  posts: Post[]
  category?: string
  variant?: 'compact' | 'full'
  className?: string
}

export default function SeriesNavigator({
  posts,
  category,
  variant = 'full',
  className = ''
}: SeriesNavigatorProps) {
  if (!posts || posts.length === 0) {
    return null
  }

  const displayPosts = variant === 'compact' ? posts.slice(0, 2) : posts.slice(0, 4)
  const label = category ? `${category}の記事で旅を続ける` : '次に読みたい記事'

  if (variant === 'compact') {
    return (
      <section
        className={`rounded-xl border border-blue-100 bg-blue-50/70 px-5 py-4 mb-8 shadow-sm ${className}`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
          SERIES NAVIGATION
        </p>
        <p className="text-blue-900 text-sm mb-3">
          {label}なら、下の記事もチェックしてみてください。
        </p>
        <div className="space-y-2">
          {displayPosts.map((post) => (
            <Link
              key={post._id}
              href={`/posts/${post.slug.current}`}
              className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white/70 px-3 py-2 text-sm text-blue-800 transition-all hover:bg-white hover:shadow"
            >
              <span className="mt-0.5 text-blue-400">→</span>
              <span className="leading-tight">{post.title}</span>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      className={`my-10 rounded-2xl border border-blue-100 bg-blue-50/80 px-6 py-6 shadow-md ${className}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">
            SERIES GUIDE
          </p>
          <h2 className="text-xl font-semibold text-blue-900">
            {label}
          </h2>
        </div>
        <span className="text-xs text-blue-500">
          全{posts.length}件からおすすめ
        </span>
      </div>
      <div className="space-y-4">
        {displayPosts.map((post, index) => (
          <Link
            key={post._id}
            href={`/posts/${post.slug.current}`}
            className="flex flex-col gap-1 rounded-xl bg-white/80 p-4 transition-all hover:bg-white hover:shadow"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                {index + 1}
              </span>
              {post.title}
            </div>
            {post.displayExcerpt && (
              <p className="text-sm text-blue-900 line-clamp-2">
                {post.displayExcerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

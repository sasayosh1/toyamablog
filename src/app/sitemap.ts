import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/sanity'

const BASE_URL = 'https://sasakiyoshimasa.com'

const staticPages = [
  '/',
  '/about',
  '/categories',
  '/privacy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  const entries: MetadataRoute.Sitemap = []

  // 静的ページ
  staticPages.forEach((path) => {
    entries.push({
      url: `${BASE_URL}${path}`,
      changeFrequency: 'weekly',
      priority: path === '/' ? 1 : 0.5,
    })
  })

  // 記事ページ
  posts.forEach((post) => {
    entries.push({
      url: `${BASE_URL}/blog/${post.slug.current}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  // カテゴリーページ（記事が存在するカテゴリのみ）
  const categoryMap = new Map<string, string>()
  posts.forEach((post) => {
    post.categories?.forEach((category) => {
      if (!categoryMap.has(category)) {
        categoryMap.set(
          category,
          `${BASE_URL}/category/${encodeURIComponent(category)}`
        )
      }
    })
  })

  categoryMap.forEach((url) => {
    entries.push({
      url,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  })

  return entries
}

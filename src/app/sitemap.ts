import type { MetadataRoute } from 'next'
import { getAllPosts, getAllTags } from '@/lib/sanity'

const BASE_URL = 'https://sasakiyoshimasa.com'

const staticPages = [
  '/',
  '/categories',
]

const legalPages = [
  '/privacy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  const entries: MetadataRoute.Sitemap = []

  // 静的ページ（多言語）
  staticPages.forEach((path) => {
    const priority = path === '/' ? 1 : 0.8
    const cleanPath = path === '/' ? '' : path

    // 日本語版
    entries.push({
      url: `${BASE_URL}${path}`,
      changeFrequency: 'weekly',
      priority,
      alternates: {
        languages: {
          ja: `${BASE_URL}${path}`,
          en: `${BASE_URL}/en${cleanPath}`,
        },
      },
    })

    // 英語版
    entries.push({
      url: `${BASE_URL}/en${cleanPath}`,
      changeFrequency: 'weekly',
      priority,
      alternates: {
        languages: {
          ja: `${BASE_URL}${path}`,
          en: `${BASE_URL}/en${cleanPath}`,
        },
      },
    })
  })

  // 法的ページ（日本語のみ）
  legalPages.forEach((path) => {
    entries.push({
      url: `${BASE_URL}${path}`,
      changeFrequency: 'monthly',
      priority: 0.3,
    })
  })

  // 記事ページ
  posts.forEach((post) => {
    const lastModified = post.publishedAt ? new Date(post.publishedAt) : new Date()

    entries.push({
      url: `${BASE_URL}/blog/${post.slug.current}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          ja: `${BASE_URL}/blog/${post.slug.current}`,
          en: `${BASE_URL}/en/blog/${post.slug.current}`,
        },
      },
    })

    entries.push({
      url: `${BASE_URL}/en/blog/${post.slug.current}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          ja: `${BASE_URL}/blog/${post.slug.current}`,
          en: `${BASE_URL}/en/blog/${post.slug.current}`,
        },
      },
    })
  })

  // カテゴリーページ（記事が存在するカテゴリのみ）
  const categorySet = new Set<string>()
  posts.forEach((post) => {
    post.categories?.forEach((category) => {
      categorySet.add(category)
    })
  })

  categorySet.forEach((category) => {
    const encodedCat = encodeURIComponent(category)
    entries.push({
      url: `${BASE_URL}/category/${encodedCat}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          ja: `${BASE_URL}/category/${encodedCat}`,
          en: `${BASE_URL}/en/category/${encodedCat}`,
        },
      },
    })

    entries.push({
      url: `${BASE_URL}/en/category/${encodedCat}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          ja: `${BASE_URL}/category/${encodedCat}`,
          en: `${BASE_URL}/en/category/${encodedCat}`,
        },
      },
    })
  })

  // タグページ
  const allTags = await getAllTags()
  allTags.forEach((tag) => {
    const encodedTag = encodeURIComponent(tag)
    entries.push({
      url: `${BASE_URL}/tag/${encodedTag}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          ja: `${BASE_URL}/tag/${encodedTag}`,
          en: `${BASE_URL}/en/tag/${encodedTag}`,
        },
      },
    })
    entries.push({
      url: `${BASE_URL}/en/tag/${encodedTag}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          ja: `${BASE_URL}/tag/${encodedTag}`,
          en: `${BASE_URL}/en/tag/${encodedTag}`,
        },
      },
    })
  })

  return entries
}

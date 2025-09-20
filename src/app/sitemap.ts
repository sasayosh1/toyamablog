import { createClient } from '@sanity/client'
import type { MetadataRoute } from 'next'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: true,
})

interface SanityPost {
  slug: string
  publishedAt: string
  _updatedAt: string
}

interface SanityCategory {
  slug: string
  _updatedAt: string
}

interface PostWithTags {
  tags?: string[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sasakiyoshimasa.com'

  try {
    // 記事データを取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(slug.current)] {
        "slug": slug.current,
        publishedAt,
        _updatedAt
      } | order(publishedAt desc)
    `)

    // カテゴリデータを取得
    const categories = await client.fetch(`
      *[_type == "category" && defined(slug.current)] {
        "slug": slug.current,
        _updatedAt
      }
    `)

    // タグデータを取得（重複除去）
    const tagsQuery = `
      *[_type == "post" && defined(tags)] {
        tags
      }
    `
    const postsWithTags: PostWithTags[] = await client.fetch(tagsQuery)
    const allTags = postsWithTags.flatMap((post: PostWithTags) => post.tags || [])
    const uniqueTags = [...new Set(allTags)]

    const sitemap: MetadataRoute.Sitemap = [
      // ホームページ
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      // aboutページ
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // 記事一覧ページ
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      // カテゴリ一覧ページ
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      // タグ一覧ページ
      {
        url: `${baseUrl}/tags`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ]

    // 個別記事ページ
    posts.forEach((post: SanityPost) => {
      sitemap.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post._updatedAt || post.publishedAt),
        changeFrequency: 'weekly',
        priority: 0.9,
      })
    })

    // 個別カテゴリページ
    categories.forEach((category: SanityCategory) => {
      sitemap.push({
        url: `${baseUrl}/categories/${category.slug}`,
        lastModified: new Date(category._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // 個別タグページ
    uniqueTags.forEach((tag: string) => {
      const encodedTag = encodeURIComponent(tag)
      sitemap.push({
        url: `${baseUrl}/tags/${encodedTag}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    })

    console.log(`Sitemap generated with ${sitemap.length} URLs`)
    return sitemap

  } catch (error) {
    console.error('Sitemap generation error:', error)

    // エラー時は基本ページのみ返す
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ]
  }
}
import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/sanity'

const BASE_URL = 'https://sasakiyoshimasa.com'

// ビルド時のプリレンダーで Sanity へのアクセスエラーを防ぐ
export const dynamic = 'force-dynamic'

export async function GET() {
  // ビルドフェーズは最低限のサイトマップのみ返して失敗を防ぐ
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const minimal = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    return new NextResponse(minimal, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
    })
  }

  try {
    const posts =
      (await getAllPosts().catch((err) => {
        console.error('fetch posts for sitemap failed', err)
        return []
      })) || []

    const staticPages = [
      '/',
      '/about',
      '/categories',
      '/privacy',
      '/terms',
    ]

    const urls: string[] = []

    // 静的ページ
    staticPages.forEach((path) => {
      urls.push(
        `<url><loc>${BASE_URL}${path}</loc><changefreq>weekly</changefreq><priority>${path === '/' ? '1.0' : '0.5'}</priority></url>`
      )
    })

    // 記事
    posts.forEach((post) => {
      const lastmod = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString()
      urls.push(
        `<url><loc>${BASE_URL}/blog/${post.slug.current}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
      )
    })

    // カテゴリ（存在するものだけ）
    const categorySet = new Set<string>()
    posts.forEach((post) => {
      post.categories?.forEach((cat) => {
        if (cat?.trim()) categorySet.add(cat.trim())
      })
      if (post.category?.trim()) categorySet.add(post.category.trim())
    })
    categorySet.forEach((cat) => {
      urls.push(
        `<url><loc>${BASE_URL}/category/${encodeURIComponent(cat)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`
      )
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('sitemap.xml generation failed', error)
    // フォールバック: 最低限のサイトマップを返して404/503を防ぐ
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    return new NextResponse(fallback, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      },
    })
  }
}

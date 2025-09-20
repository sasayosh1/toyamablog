import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: true,
})

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  description?: string
  publishedAt: string
  _updatedAt: string
  category?: string
  tags?: string[]
}

export async function GET() {
  try {
    const posts: Post[] = await client.fetch(`
      *[_type == "post" && defined(slug.current) && defined(publishedAt)] {
        _id,
        title,
        slug,
        excerpt,
        description,
        publishedAt,
        _updatedAt,
        "category": category->title,
        tags
      } | order(publishedAt desc)[0...50]
    `)

    const baseUrl = 'https://sasakiyoshimasa.com'
    const lastBuildDate = new Date().toUTCString()

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ささよしブログ - 富山県の魅力発信</title>
    <description>富山県の魅力的なスポット、グルメ、観光情報を地元目線でお届けするブログです。</description>
    <link>${baseUrl}</link>
    <language>ja</language>
    <managingEditor>noreply@sasakiyoshimasa.com (ささよし)</managingEditor>
    <webMaster>noreply@sasakiyoshimasa.com</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Next.js RSS Generator</generator>
    <ttl>60</ttl>

    ${posts.map(post => {
      const postUrl = `${baseUrl}/blog/${post.slug.current}`
      const description = post.excerpt || post.description || `${post.title}の記事です。富山県の魅力をお届けします。`
      const cleanTitle = post.title.replace(/【.*?】/, '').replace(/#shorts.*/, '').trim()
      const pubDate = new Date(post.publishedAt).toUTCString()
      const category = post.category || '富山県'

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${category}]]></category>
      ${post.tags ? post.tags.slice(0, 5).map(tag => `<category><![CDATA[${tag}]]></category>`).join('') : ''}
      <dc:creator><![CDATA[ささよし]]></dc:creator>
      <content:encoded><![CDATA[
        <div>
          <h2>${cleanTitle}</h2>
          <p>${description}</p>
          <p><a href="${postUrl}">続きを読む &raquo;</a></p>
        </div>
      ]]></content:encoded>
    </item>`
    }).join('')}

  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })

  } catch (error) {
    console.error('RSS feed generation error:', error)

    // エラー時は最小限のRSSを返す
    const errorRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ささよしブログ - 富山県の魅力発信</title>
    <description>富山県の魅力的なスポット、グルメ、観光情報を地元目線でお届けするブログです。</description>
    <link>https://sasakiyoshimasa.com</link>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new NextResponse(errorRss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  }
}
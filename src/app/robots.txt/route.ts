import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://sasakiyoshimasa.com'

  const robotsTxt = `User-agent: *
Allow: /

# SEO optimization
Allow: /blog
Allow: /categories
Allow: /tags
Allow: /about

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/feed.xml

# Block admin areas
Disallow: /studio
Disallow: /api
Disallow: /_next
Disallow: /admin

# Block sensitive files
Disallow: /*.json$
Disallow: /*.log$
Disallow: /.*

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Host directive
Host: ${baseUrl}`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
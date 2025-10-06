import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://sasakiyoshimasa.com'

  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/feed.xml

# Block admin areas
Disallow: /studio
Disallow: /admin
Disallow: /api
Disallow: /api/

# Block sensitive files
Disallow: /*.json$
Disallow: /*.log$

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

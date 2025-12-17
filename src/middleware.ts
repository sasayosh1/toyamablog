import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // SNS共有・トラッキング系クエリはインデックス/集計を汚すので除去して正規URLへ
  // next.config.ts の redirects ではクエリ削除ができずループしやすいため、middlewareで処理する
  if (request.method === 'GET' || request.method === 'HEAD') {
    const trackingKeys = [
      'share',
      'nb',
      'fbclid',
      'gclid',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ]

    let changed = false
    const cleaned = new URL(request.url)
    trackingKeys.forEach((key) => {
      if (cleaned.searchParams.has(key)) {
        cleaned.searchParams.delete(key)
        changed = true
      }
    })

    // 余計な ? を消す
    if (changed) {
      if ([...cleaned.searchParams.keys()].length === 0) {
        cleaned.search = ''
      }
      return NextResponse.redirect(cleaned, 308)
    }
  }

  // /structure 配下はすべて categories に統一（リダイレクト）
  if (path.startsWith('/structure/')) {
    return NextResponse.redirect(new URL('/categories', request.url), 308)
  }

  const response = NextResponse.next()

  // Studio は検索対象外にしたいのでメタヘッダーのみ調整
  if (path.startsWith('/studio')) {
    response.headers.set('X-Robots-Tag', 'noindex')
  }

  return response
}

export const config = {
  matcher: [
    // app router pages
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon.svg|apple-touch-icon.png).*)',
  ],
}

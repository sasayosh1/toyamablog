import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // --- Legacy URL cleanup (WordPress/old pagination/etc) ---
  // GSC の 404 が大量に出やすいパターンを、404にせず正規URLへ寄せる。
  // ※ next.config.ts の redirects では query 条件が扱いづらい/ループしやすいので middleware で処理。
  if (request.method === 'GET' || request.method === 'HEAD') {
    const url = new URL(request.url)

    // WordPress 由来のクエリ（/?p=123 など）
    if (url.searchParams.has('p')) {
      // 旧記事IDからslugへの復元はできないのでトップへ誘導（404回避/UX優先）
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url, 308)
    }

    // AMP系
    if (url.searchParams.has('amp')) {
      url.searchParams.delete('amp')
      if ([...url.searchParams.keys()].length === 0) url.search = ''
      return NextResponse.redirect(url, 308)
    }

    // /feed /rss /atom など
    if (
      path === '/feed' ||
      path === '/rss' ||
      path === '/rss.xml' ||
      path === '/atom.xml' ||
      path.endsWith('/feed') ||
      path.endsWith('/feed/')
    ) {
      return NextResponse.redirect(new URL('/', request.url), 308)
    }

    // WP 管理/資産系（クロールされやすいがサイトには存在しない）
    if (
      path === '/xmlrpc.php' ||
      path.startsWith('/wp-admin') ||
      path.startsWith('/wp-login') ||
      path.startsWith('/wp-json') ||
      path.startsWith('/wp-content') ||
      path.startsWith('/wp-includes') ||
      path.startsWith('/wp-')
    ) {
      return NextResponse.redirect(new URL('/', request.url), 308)
    }

    // 旧ページネーション
    const tagPaging = path.match(/^\/tag\/([^/]+)\/page\/\d+\/?$/)
    if (tagPaging) {
      return NextResponse.redirect(new URL(`/tag/${tagPaging[1]}`, request.url), 308)
    }
    const categoryPaging = path.match(/^\/category\/([^/]+)\/page\/\d+\/?$/)
    if (categoryPaging) {
      return NextResponse.redirect(new URL(`/category/${categoryPaging[1]}`, request.url), 308)
    }
    const blogPaging = path.match(/^\/blog\/page\/\d+\/?$/)
    if (blogPaging) {
      return NextResponse.redirect(new URL('/', request.url), 308)
    }

    // Google Search Console verification files should be served as-is.
    if (path === '/google613d0403c01cf012.html') {
      return NextResponse.next()
    }

    // 拡張子付きの旧URL（.php/.html など）をトップへ
    if (/\.(php|html?)$/i.test(path)) {
      return NextResponse.redirect(new URL('/', request.url), 308)
    }

    // 日本語タイトル系の旧URL（【...】...）はカテゴリ一覧へ
    // （Next.js ルーティング側では正規表現マッチが不安定なので、ここで確実に吸収）
    if (path.includes('【') || path.includes('】') || request.url.includes('%E3%80%90')) {
      return NextResponse.redirect(new URL('/categories', request.url), 308)
    }
  }

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
      'utm_id',
      'utm_name',
      'utm_source_platform',
      'utm_creative_format',
      'utm_marketing_tactic',
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

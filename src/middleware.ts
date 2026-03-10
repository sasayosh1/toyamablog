import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // --- Redirect Logic Consolidation ---
  // SNS共有・トラッキング系クエリの除去、および旧URLのクリーンアップを一括で行う。
  // 多重リダイレクトを避けるため、一度の状態変更で最終的な宛先を決定する。
  if (request.method === 'GET' || request.method === 'HEAD') {
    const url = new URL(request.url)
    let changed = false
    let finalPathname = url.pathname

    // 1. トラッキングクエリの除去
    const trackingKeys = [
      'share', 'nb', 'fbclid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign',
      'utm_content', 'utm_term', 'utm_id', 'utm_name', 'utm_source_platform',
      'utm_creative_format', 'utm_marketing_tactic',
    ]
    trackingKeys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key)
        changed = true
      }
    })

    // 2. 旧URLクリーンアップ (Legacy URL cleanup)
    // WordPress 由来のクエリ（/?p=123 など） -> トップへ
    if (url.searchParams.has('p') || url.searchParams.has('cat')) {
      finalPathname = '/'
      url.search = '' // クエリ全削除
      changed = true
    }

    // categoryパラメータ（名前指定）はカテゴリページへ
    if (url.searchParams.has('category')) {
      const category = url.searchParams.get('category')
      if (category) {
        finalPathname = `/category/${encodeURIComponent(category)}`
        url.search = ''
        changed = true
      }
    }

    // AMP系クエリ除去
    if (url.searchParams.has('amp')) {
      url.searchParams.delete('amp')
      changed = true
    }

    // パスベースのクリーンアップ
    // /feed /rss /atom など -> トップ
    if (
      finalPathname === '/feed' ||
      finalPathname === '/rss' ||
      finalPathname === '/rss.xml' ||
      finalPathname === '/atom.xml' ||
      finalPathname.endsWith('/feed') ||
      finalPathname.endsWith('/feed/')
    ) {
      finalPathname = '/'
      changed = true
    }

    // WP 管理/資産系 -> トップ (Soft 404 回避のため、本来は 410 等が望ましいが現状の挙動を維持)
    if (
      finalPathname === '/xmlrpc.php' ||
      finalPathname.startsWith('/wp-admin') ||
      finalPathname.startsWith('/wp-login') ||
      finalPathname.startsWith('/wp-json') ||
      finalPathname.startsWith('/wp-content') ||
      finalPathname.startsWith('/wp-includes') ||
      finalPathname.startsWith('/wp-')
    ) {
      finalPathname = '/'
      changed = true
    }

    // 拡張子付きの旧URL -> トップ
    if (/\.(php|html?)$/i.test(finalPathname) && finalPathname !== '/studio-access.html' && finalPathname !== '/google613d0403c01cf012.html') {
      finalPathname = '/'
      changed = true
    }

    // 日本語タイトル系の旧URL（【...】...）はカテゴリ一覧へ
    if (finalPathname.includes('【') || finalPathname.includes('】') || request.url.includes('%E3%80%90')) {
      finalPathname = '/categories'
      changed = true
    }

    // /structure 配下はすべて categories に統一
    if (finalPathname.startsWith('/structure/')) {
      finalPathname = '/categories'
      changed = true
    }

    // 変更があった場合のみ一度だけリダイレクト
    if (changed || finalPathname !== url.pathname) {
      url.pathname = finalPathname
      if ([...url.searchParams.keys()].length === 0) url.search = ''
      return NextResponse.redirect(url, 308)
    }
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
    '/((?!_next/static|_next/image|api/webhooks|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon.svg|apple-touch-icon.png).*)',
  ],
}

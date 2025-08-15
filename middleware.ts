import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // 間違ったルートをリダイレクト
  if (pathname.startsWith('/structure/')) {
    // /structure/category -> /categories にリダイレクト
    if (pathname === '/structure/category' || pathname.startsWith('/structure/category/')) {
      return NextResponse.redirect(new URL('/categories', req.url))
    }
    // その他の /structure/* は /categories にリダイレクト
    return NextResponse.redirect(new URL('/categories', req.url))
  }

  // Studio用の設定
  if (!pathname.startsWith('/studio')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // 既存のブロック系ヘッダーを除去
  res.headers.delete('x-frame-options')
  res.headers.delete('content-security-policy')

  // Sanity ダッシュボードからの埋め込みを許可
  res.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://sanity.io https://*.sanity.io"
  )

  // Studio は検索対象外でOK
  res.headers.set('X-Robots-Tag', 'noindex')

  return res
}

export const config = {
  matcher: ['/studio/:path*', '/structure/:path*'],
}
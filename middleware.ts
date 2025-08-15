import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/studio')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // 既存のブロック系ヘッダーを除去
  res.headers.delete('x-frame-options')
  res.headers.delete('content-security-policy')

  // Sanity ダッシュボードからの埋め込みを許可
  // ※ ALLOW-FROM は非推奨なので使わず、CSP の frame-ancestors を設定
  res.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://sanity.io https://*.sanity.io"
  )

  // Studio は検索対象外でOK
  res.headers.set('X-Robots-Tag', 'noindex')

  return res
}

// /studio 配下だけ適用
export const config = {
  matcher: ['/studio/:path*'],
}
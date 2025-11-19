import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // /structure 配下はすべて categories に統一（リダイレクト）
  if (path.startsWith('/structure/')) {
    return NextResponse.redirect(new URL('/categories', request.url))
  }

  const response = NextResponse.next()

  // Studio は検索対象外にしたいのでメタヘッダーのみ調整
  if (path.startsWith('/studio')) {
    response.headers.set('X-Robots-Tag', 'noindex')
  }

  return response
}

export const config = {
  matcher: ['/studio/:path*', '/structure/:path*'],
}

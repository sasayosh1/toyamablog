import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // セキュリティヘッダーの強化
  const response = NextResponse.next()
  
  // XSS攻撃防止
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // MIME type sniffing攻撃防止
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Clickjacking攻撃防止
  response.headers.set('X-Frame-Options', 'DENY')
  
  // リファラーポリシー
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // 機能ポリシー（不要な機能を無効化）
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), ' +
    'accelerometer=(), gyroscope=(), magnetometer=()'
  )

  // レート制限（簡易版）
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
  const isAPIRoute = request.nextUrl.pathname.startsWith('/api/')
  
  if (isAPIRoute) {
    // APIルートに対する追加セキュリティ
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  // 開発環境でのみデバッグヘッダーを追加
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Debug-IP', ip.split(',')[0])
    response.headers.set('X-Debug-Path', request.nextUrl.pathname)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
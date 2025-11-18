import type { NextConfig } from "next";

/** @type {import("next").NextConfig} */
const nextConfig: NextConfig = {
  // 画像最適化完全無効化（強制）
  images: {
    unoptimized: true,
    formats: [],
    deviceSizes: [],
    imageSizes: [],
    minimumCacheTTL: 0,
  },

  // 静的生成最適化（モバイル読み込み速度向上）
  experimental: {
    optimizePackageImports: ['lucide-react', '@sanity/client', '@portabletext/react'],
  },
  
  
  // コンパイル最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  
  // パフォーマンス最適化
  poweredByHeader: false,
  compress: true,
  
  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/structure/:path*',
        destination: '/categories',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'share' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'nb' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'utm_source' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'utm_medium' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'utm_campaign' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'utm_content' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'utm_term' }],
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'query', key: 'fbclid' }],
        destination: '/:path*',
        permanent: true,
      },
    ];
  },

  // セキュリティヘッダー
  async headers() {
    return [
      // Studio paths MUST come first (more specific pattern takes precedence)
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io",
              "style-src 'self' 'unsafe-inline' https://cdn.sanity.io https://*.sanity.io https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://*.sanity.io https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.sanity.io https://*.sanity.io",
              "connect-src 'self' https://*.sanity.io https://cdn.sanity.io wss://*.sanity.io",
              "frame-src 'self' https://sanity.io https://*.sanity.io",
              "frame-ancestors 'self' https://sanity.io https://*.sanity.io"
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // All other paths (must come after more specific patterns)
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://partner.googleadservices.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://*.supabase.co wss://*.supabase.co https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://stats.g.doubleclick.net",
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
              "media-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), vr=(), accelerometer=(), gyroscope=(), magnetometer=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

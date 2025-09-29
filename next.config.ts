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
  
  // Sanity CMS用設定
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
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

  // 開発時最適化 + Sanity Studio対応
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['node_modules', '.next'],
      };
      config.devtool = 'eval-cheap-module-source-map';
    }

    // Sanity Studio用の最適化
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // web-vitalsモジュール解決の問題を修正
    config.resolve.alias = {
      ...config.resolve.alias,
      'web-vitals': require.resolve('web-vitals'),
    };

    return config;
  },
  
  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/structure/:path*',
        destination: '/categories',
        permanent: true,
      },
    ];
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/((?!studio).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.google.com",
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
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io",
              "style-src 'self' 'unsafe-inline' https://cdn.sanity.io https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.sanity.io",
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
    ];
  },
};

export default nextConfig;

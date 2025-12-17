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

  // Sanity Studioをビルドから除外
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'sanity': 'commonjs sanity',
      })
    }
    return config
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
      // 末尾スラッシュを正規化（/foo/ → /foo）
      // ※ `/` は対象外（:path+ なので最低1セグメント必要）
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
      // 旧 /tags/* を /tag/* に統一
      {
        source: '/tags/:tag',
        destination: '/tag/:tag',
        permanent: true,
      },
      // 旧 author アーカイブをサイトについてへ
      {
        source: '/author/:path*',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/posts/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      // 旧タグ（日本語スラッグ）を英数字に集約
      {
        source: '/tag/夜高行燈',
        destination: '/tag/yotaka-lantern',
        permanent: true,
      },
      {
        source: '/post/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/page/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:year(\\d{4})/:month(\\d{2})/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:year(\\d{4})/:month(\\d{2})',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:year(\\d{4})/page/:page(\\d+)',
        destination: '/',
        permanent: true,
      },
      {
        source: '/structure/:path*',
        destination: '/categories',
        permanent: true,
      },
      // 旧サイトマップ系を新サイトマップへ集約
      {
        source: '/sitemap.xml.gz',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/add-sitemap.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/page-sitemap.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/post-sitemap.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      // 記事スラッグを正規化（toyama- プレフィックス＋英数字ハイフンのみに集約）
      { source: '/blog/fukuoka-town-park-15', destination: '/blog/toyama-fukuoka-park-koi-haven', permanent: true },
      { source: '/blog/fuchu-town-castle-ver-yosakoi', destination: '/blog/toyama-fuchu-castle-yosakoi-festival', permanent: true },
      { source: '/blog/yatsuo-town-400', destination: '/blog/toyama-yatsuo-town-heritage-streets', permanent: true },
      { source: '/blog/park', destination: '/blog/toyama-funahashi-kyotsubogawa-park', permanent: true },
      { source: '/blog/yatsuo-town-3', destination: '/blog/toyama-yatsuo-hikiyama-3years', permanent: true },
      { source: '/blog/fukuoka-town-1000-sakura-1000', destination: '/blog/toyama-fukuoka-sakura-avenue-1000', permanent: true },
      { source: '/blog/yatsuo-town', destination: '/blog/toyama-yatsuo-hikiyama-museum', permanent: true },
      { source: '/blog/yatsuo-town-2023-33-27-in-2023', destination: '/blog/toyama-yatsuo-saka-art-2023', permanent: true },
      { source: '/blog/namerikawa-city-shrine', destination: '/blog/toyama-namerikawa-ichihara-shrine', permanent: true },
      { source: '/blog/takaoka-city-temple', destination: '/blog/toyama-takaoka-kokuhou-shokouji', permanent: true },
      { source: '/blog/funahashi-village-1-260', destination: '/blog/toyama-funahashi-taiyaki-260yen', permanent: true },
      { source: '/blog/en-cos-japan-2024-in-toyama', destination: '/blog/toyama-fantasy-weapon-shop-cosplay', permanent: true },
      { source: '/blog/kamiichi-town-2024-festival-fireworks-bridge-2024', destination: '/blog/toyama-kamiichi-furusato-festival-2024', permanent: true },
      { source: '/blog/takaoka-city-temple-1', destination: '/blog/toyama-takaoka-uzusama-myo-o-zuiryuji', permanent: true },
      { source: '/blog/fuchu-town', destination: '/blog/toyama-fuchu-sunflower-farm', permanent: true },
      { source: '/blog/takaoka-city-bread', destination: '/blog/toyama-takaoka-pan-dream-bakery', permanent: true },
      { source: '/blog/uozu-city-aquarium-3', destination: '/blog/toyama-uozu-aquarium-penguins', permanent: true },
      { source: '/blog/yatsuo-town-1', destination: '/blog/toyama-yatsuo-machiya-tsunagu', permanent: true },
      { source: '/blog/fuchu-town-1', destination: '/blog/toyama-fuchu-tamura-farm-animals', permanent: true },
      { source: '/blog/yatsuo-town-2024-2024-5-3', destination: '/blog/toyama-yatsuo-hikiyama-2024-05-03', permanent: true },
      { source: '/blog/kamiichi-town-temple', destination: '/blog/toyama-kamiichi-o-iwayama-nissekiji', permanent: true },
      { source: '/blog/takaoka-city-park-sakura-castle', destination: '/blog/toyama-takaoka-castle-park-sakura-walk', permanent: true },
      { source: '/blog/asahi-town-2024-sakura-2024', destination: '/blog/toyama-asahi-funakawa-sakura-2024', permanent: true },
      { source: '/blog/tonami-city-61', destination: '/blog/toyama-tonami-garrison-61st-anniversary', permanent: true },
      { source: '/blog/namerikawa-city-museum', destination: '/blog/toyama-namerikawa-hotaruika-museum', permanent: true },
      { source: '/blog/nanto-city-sakura-restaurant-johanare', destination: '/blog/toyama-nanto-sakura-restaurant-johanare', permanent: true },
      { source: '/blog/tonami-city-dam', destination: '/blog/toyama-tonami-komaki-dam-boat-view', permanent: true },
      { source: '/blog/kurobe-city-cafe', destination: '/blog/toyama-kurobe-gallery-cafe-hokuyo', permanent: true },
      { source: '/blog/imizu-city-100', destination: '/blog/toyama-imizu-taikoyama-koi-pond', permanent: true },
      { source: '/blog/imizu-city-2', destination: '/blog/toyama-imizu-kodomomirai-dollhouse', permanent: true },
      { source: '/blog/money-exchange-70myr-rate-26-07-1824jpy', destination: '/blog/toyama-money-exchange-70myr', permanent: true },
      { source: '/blog/nanto-city-temple-castle-500', destination: '/blog/toyama-nanto-zen-tokuji-gate-500years', permanent: true },
      { source: '/blog/tonami-city-bridge', destination: '/blog/toyama-tonami-kakuryu-bridge', permanent: true },
      { source: '/blog/kurobe-city-dam-station-bridge', destination: '/blog/toyama-kurobe-unazuki-dam-walk', permanent: true },
      { source: '/blog/yatsuo-town-2023-300-2023', destination: '/blog/toyama-yatsuo-spring-festival-2023', permanent: true },
      { source: '/blog/imizu-city-4', destination: '/blog/toyama-imizu-kaiohmaru-night-view', permanent: true },
      { source: '/blog/namerikawa-city-merika-9', destination: '/blog/toyama-namerikawa-merika-pony', permanent: true },
      { source: '/blog/uozu-city', destination: '/blog/toyama-uozu-katakayama-camp', permanent: true },
      { source: '/blog/tonami-city-festival', destination: '/blog/toyama-tonami-yotaka-festival', permanent: true },

      // 旧URL（市町村ベース）をカテゴリーへ寄せる（GSCの404削減＆UX改善）
      { source: '/blog/toyama-city', destination: '/category/富山市', permanent: true },
      { source: '/blog/toyama-city-:rest(.*)', destination: '/category/富山市', permanent: true },
      { source: '/toyama-city-:rest(.*)', destination: '/category/富山市', permanent: true },

      { source: '/blog/takaoka-city', destination: '/category/高岡市', permanent: true },
      { source: '/blog/takaoka-city-:rest(.*)', destination: '/category/高岡市', permanent: true },

      { source: '/blog/uozu-city', destination: '/category/魚津市', permanent: true },
      { source: '/blog/uozu-city-:rest(.*)', destination: '/category/魚津市', permanent: true },

      { source: '/blog/himi-city', destination: '/category/氷見市', permanent: true },
      { source: '/blog/himi-city-:rest(.*)', destination: '/category/氷見市', permanent: true },

      { source: '/blog/namerikawa-city', destination: '/category/滑川市', permanent: true },
      { source: '/blog/namerikawa-city-:rest(.*)', destination: '/category/滑川市', permanent: true },

      { source: '/blog/kurobe-city', destination: '/category/黒部市', permanent: true },
      { source: '/blog/kurobe-city-:rest(.*)', destination: '/category/黒部市', permanent: true },

      { source: '/blog/tonami-city', destination: '/category/砺波市', permanent: true },
      { source: '/blog/tonami-city-:rest(.*)', destination: '/category/砺波市', permanent: true },

      { source: '/blog/oyabe-city', destination: '/category/小矢部市', permanent: true },
      { source: '/blog/oyabe-city-:rest(.*)', destination: '/category/小矢部市', permanent: true },

      { source: '/blog/nanto-city', destination: '/category/南砺市', permanent: true },
      { source: '/blog/nanto-city-:rest(.*)', destination: '/category/南砺市', permanent: true },

      { source: '/blog/imizu-city', destination: '/category/射水市', permanent: true },
      { source: '/blog/imizu-city-:rest(.*)', destination: '/category/射水市', permanent: true },

      { source: '/blog/nyuzen-town', destination: '/category/入善町', permanent: true },
      { source: '/blog/nyuzen-town-:rest(.*)', destination: '/category/入善町', permanent: true },

      { source: '/blog/kamiichi-town', destination: '/category/上市町', permanent: true },
      { source: '/blog/kamiichi-town-:rest(.*)', destination: '/category/上市町', permanent: true },

      { source: '/blog/tateyama-town', destination: '/category/立山町', permanent: true },
      { source: '/blog/tateyama-town-:rest(.*)', destination: '/category/立山町', permanent: true },

      { source: '/blog/asahi-town', destination: '/category/朝日町', permanent: true },
      { source: '/blog/asahi-town-:rest(.*)', destination: '/category/朝日町', permanent: true },

      { source: '/blog/funahashi-village', destination: '/category/舟橋村', permanent: true },
      { source: '/blog/funahashi-village-:rest(.*)', destination: '/category/舟橋村', permanent: true },

      // 日本語タイトルの旧URL（/【...】.../ 等）をカテゴリーへ誘導
      // ※ 旧URLの個別マッピングが難しいため、まずは404を減らしてUXを守る
      { source: '/:rest(【.*】.*)', destination: '/categories', permanent: true },

      // 日本語プレフィックスの旧記事URL（/blog/富山-... 等）を該当市町村へ誘導
      { source: '/blog/富山-:rest(.*)', destination: '/category/富山市', permanent: true },
      { source: '/blog/高岡-:rest(.*)', destination: '/category/高岡市', permanent: true },
      { source: '/blog/魚津-:rest(.*)', destination: '/category/魚津市', permanent: true },
      { source: '/blog/氷見-:rest(.*)', destination: '/category/氷見市', permanent: true },
      { source: '/blog/滑川-:rest(.*)', destination: '/category/滑川市', permanent: true },
      { source: '/blog/黒部-:rest(.*)', destination: '/category/黒部市', permanent: true },
      { source: '/blog/砺波-:rest(.*)', destination: '/category/砺波市', permanent: true },
      { source: '/blog/小矢部-:rest(.*)', destination: '/category/小矢部市', permanent: true },
      { source: '/blog/南砺-:rest(.*)', destination: '/category/南砺市', permanent: true },
      { source: '/blog/射水-:rest(.*)', destination: '/category/射水市', permanent: true },
      { source: '/blog/上市-:rest(.*)', destination: '/category/上市町', permanent: true },
      { source: '/blog/立山-:rest(.*)', destination: '/category/立山町', permanent: true },
      { source: '/blog/入善-:rest(.*)', destination: '/category/入善町', permanent: true },
      { source: '/blog/朝日-:rest(.*)', destination: '/category/朝日町', permanent: true },
    ];
  },

  // セキュリティヘッダー
  async headers() {
    return [
      // Studio root path (exact match) - MUST NOT have X-Frame-Options
      {
        source: '/studio',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io https://manage.sanity.io",
              "style-src 'self' 'unsafe-inline' https://cdn.sanity.io https://*.sanity.io https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://*.sanity.io https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.sanity.io https://*.sanity.io",
              "connect-src 'self' https://*.sanity.io https://cdn.sanity.io wss://*.sanity.io https://manage.sanity.io",
              "frame-src 'self' https://sanity.io https://*.sanity.io https://manage.sanity.io",
              "frame-ancestors 'self' https://sanity.io https://*.sanity.io https://manage.sanity.io"
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
      // Studio subpaths - MUST NOT have X-Frame-Options
      {
        source: '/studio/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://*.sanity.io https://manage.sanity.io",
              "style-src 'self' 'unsafe-inline' https://cdn.sanity.io https://*.sanity.io https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://*.sanity.io https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.sanity.io https://*.sanity.io",
              "connect-src 'self' https://*.sanity.io https://cdn.sanity.io wss://*.sanity.io https://manage.sanity.io",
              "frame-src 'self' https://sanity.io https://*.sanity.io https://manage.sanity.io",
              "frame-ancestors 'self' https://sanity.io https://*.sanity.io https://manage.sanity.io"
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
      // All other paths (exclude Studio) must come after more specific patterns
      {
        source: '/((?!studio).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://partner.googleadservices.com https://cdn.sanity.io https://*.sanity.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.sanity.io https://*.sanity.io",
              "img-src 'self' data: https: blob: https://cdn.sanity.io https://i.ytimg.com https://img.youtube.com https://*.sanity.io",
              "font-src 'self' https://fonts.gstatic.com https://cdn.sanity.io https://*.sanity.io",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com https://*.supabase.co wss://*.supabase.co https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://stats.g.doubleclick.net https://cdn.sanity.io https://*.sanity.io",
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
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
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

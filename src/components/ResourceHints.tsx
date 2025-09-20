import Head from 'next/head'

interface ResourceHintsProps {
  preloadImages?: string[]
  prefetchPaths?: string[]
  enableCriticalResources?: boolean
}

export default function ResourceHints({
  preloadImages = [],
  prefetchPaths = [],
  enableCriticalResources = true
}: ResourceHintsProps) {
  return (
    <Head>
      {/* 重要フォントのプリロード */}
      {enableCriticalResources && (
        <>
          <link
            rel="preload"
            href="https://fonts.gstatic.com/s/geist/v1/geist-sans-regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
          <link
            rel="preload"
            href="https://fonts.gstatic.com/s/geist/v1/geist-mono-regular.woff2"
            as="font"
            type="font/woff2"
            crossOrigin=""
          />
        </>
      )}

      {/* ヒーロー画像のプリロード */}
      {enableCriticalResources && (
        <link
          rel="preload"
          href="/images/toyama-hero.png"
          as="image"
          type="image/png"
        />
      )}

      {/* 動的な画像プリロード */}
      {preloadImages.map((imageUrl, index) => (
        <link
          key={`preload-image-${index}`}
          rel="preload"
          href={imageUrl}
          as="image"
          type={imageUrl.includes('.webp') ? 'image/webp' :
                imageUrl.includes('.png') ? 'image/png' :
                imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') ? 'image/jpeg' :
                'image/*'}
        />
      ))}

      {/* ページプリフェッチ */}
      {prefetchPaths.map((path, index) => (
        <link
          key={`prefetch-page-${index}`}
          rel="prefetch"
          href={path}
        />
      ))}

      {/* 重要なAPIエンドポイントのDNSプリフェッチ */}
      <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      <link rel="dns-prefetch" href="https://i.ytimg.com" />
      <link rel="dns-prefetch" href="https://img.youtube.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

      {/* 外部APIへの事前接続 */}
      <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {/* 重要CSS/JSのプリロード */}
      {enableCriticalResources && (
        <>
          <link
            rel="modulepreload"
            href="/_next/static/chunks/polyfills.js"
          />
          <link
            rel="modulepreload"
            href="/_next/static/chunks/main.js"
          />
          <link
            rel="modulepreload"
            href="/_next/static/chunks/framework.js"
          />
        </>
      )}

      {/* リソースヒント設定 */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />

      {/* キャッシュ制御 */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
    </Head>
  )
}

// 高優先度の画像プリローダー
export function PreloadCriticalImages({ images }: { images: string[] }) {
  return (
    <>
      {images.slice(0, 3).map((imageUrl, index) => (
        <link
          key={`critical-image-${index}`}
          rel="preload"
          href={imageUrl}
          as="image"
          fetchPriority="high"
        />
      ))}
    </>
  )
}

// 次ページプリフェッチャー
export function PrefetchNextPages({ paths }: { paths: string[] }) {
  return (
    <>
      {paths.slice(0, 5).map((path, index) => (
        <link
          key={`prefetch-next-${index}`}
          rel="prefetch"
          href={path}
          as="document"
        />
      ))}
    </>
  )
}
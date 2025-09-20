// Service Worker for 富山のくせに ブログ
// 高度なキャッシュ戦略とオフライン対応

const CACHE_NAME = 'toyama-blog-v1.2.0'
const STATIC_CACHE = 'toyama-static-v1.2.0'
const RUNTIME_CACHE = 'toyama-runtime-v1.2.0'
const IMAGE_CACHE = 'toyama-images-v1.2.0'

// キャッシュする重要なリソース
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/images/toyama-hero.png',
  '/images/og-image.png',
  '/favicon.ico',
  '/icon.svg'
]

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: インストール開始')

  event.waitUntil(
    Promise.all([
      // 静的アセットをキャッシュ
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS)
      }),
      // 即座にアクティブ化
      self.skipWaiting()
    ])
  )
})

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: アクティベート開始')

  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(cacheName)) {
              console.log('🗑️ 古いキャッシュを削除:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // 全てのクライアントを制御
      self.clients.claim()
    ])
  )
})

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Sanity Studio や外部APIは通常通り
  if (url.pathname.startsWith('/studio') ||
      url.hostname !== self.location.hostname ||
      request.method !== 'GET') {
    return
  }

  event.respondWith(handleRequest(request))
})

// 高度なリクエスト処理
async function handleRequest(request) {
  const url = new URL(request.url)

  try {
    // 1. 静的アセット (Cache First)
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE)
    }

    // 2. 画像リソース (Cache First with Stale While Revalidate)
    if (isImage(url.pathname)) {
      return await staleWhileRevalidate(request, IMAGE_CACHE, 86400000) // 24時間
    }

    // 3. APIレスポンス (Network First with Cache Fallback)
    if (url.pathname.startsWith('/api/')) {
      return await networkFirst(request, RUNTIME_CACHE, 300000) // 5分
    }

    // 4. ページレスポンス (Stale While Revalidate)
    if (isHTMLRequest(request)) {
      return await staleWhileRevalidate(request, RUNTIME_CACHE, 600000) // 10分
    }

    // 5. その他のリソース (Network First)
    return await networkFirst(request, RUNTIME_CACHE, 60000) // 1分

  } catch (error) {
    console.warn('⚠️ リクエスト処理エラー:', error)

    // オフライン時のフォールバック
    if (isHTMLRequest(request)) {
      const offlinePage = await caches.match('/offline')
      if (offlinePage) {
        return offlinePage
      }
    }

    // 最低限のエラーレスポンス
    return new Response('オフラインです', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}

// キャッシュ戦略の実装

// Cache First: キャッシュ優先
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone())
  }
  return networkResponse
}

// Network First: ネットワーク優先
async function networkFirst(request, cacheName, maxAge = 300000) {
  const cache = await caches.open(cacheName)

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      // 有効期限をヘッダーに追加してキャッシュ
      const responseWithExpiry = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cache-timestamp': Date.now().toString(),
          'sw-cache-max-age': maxAge.toString()
        }
      })
      cache.put(request, responseWithExpiry.clone())
      return responseWithExpiry
    }
    throw new Error('Network response not ok')
  } catch (error) {
    // ネットワークエラー時はキャッシュから取得
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// Stale While Revalidate: キャッシュを返しつつバックグラウンドで更新
async function staleWhileRevalidate(request, cacheName, maxAge = 600000) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  // バックグラウンドでの更新を開始
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const responseWithExpiry = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cache-timestamp': Date.now().toString(),
          'sw-cache-max-age': maxAge.toString()
        }
      })
      cache.put(request, responseWithExpiry.clone())
    }
    return networkResponse
  }).catch(() => null)

  // キャッシュがある場合は即座に返す
  if (cached) {
    // キャッシュの有効期限をチェック
    const cacheTimestamp = cached.headers.get('sw-cache-timestamp')
    const cacheMaxAge = cached.headers.get('sw-cache-max-age')

    if (cacheTimestamp && cacheMaxAge) {
      const age = Date.now() - parseInt(cacheTimestamp)
      if (age < parseInt(cacheMaxAge)) {
        return cached
      }
    }
  }

  // キャッシュがないか期限切れの場合はネットワークを待つ
  return (await fetchPromise) || cached || fetch(request)
}

// ヘルパー関数
function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|woff|woff2|ttf|ico|svg)$/) ||
         pathname === '/' ||
         pathname === '/manifest.json'
}

function isImage(pathname) {
  return pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/) ||
         pathname.includes('i.ytimg.com') ||
         pathname.includes('img.youtube.com') ||
         pathname.includes('cdn.sanity.io')
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html')
}

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // オフライン時に蓄積されたデータを同期
    console.log('🔄 バックグラウンド同期を実行')

    // 例: Analytics データの送信
    // 例: ユーザーアクションの同期
  } catch (error) {
    console.warn('⚠️ バックグラウンド同期エラー:', error)
  }
}

// Push通知の処理
self.addEventListener('push', (event) => {
  if (!event.data) return

  const options = {
    body: event.data.text(),
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '記事を読む',
        icon: '/images/icons/read.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: '/images/icons/close.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('富山のくせに - 新着記事', options)
  )
})

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// キャッシュ統計の定期報告
setInterval(() => {
  if (self.clients) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        caches.keys().then((cacheNames) => {
          client.postMessage({
            type: 'CACHE_STATS',
            caches: cacheNames.length,
            version: CACHE_NAME
          })
        })
      })
    })
  }
}, 60000) // 1分ごと

console.log('🚀 Service Worker: 富山のくせに ブログ - 準備完了!')
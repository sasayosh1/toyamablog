'use client'

import { useEffect, useState } from 'react'

export default function ServiceWorkerRegistration() {
  const [swStatus, setSwStatus] = useState<'loading' | 'ready' | 'error' | 'unsupported'>('loading')
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported')
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })

        console.log('✅ Service Worker登録成功:', registration.scope)
        setSwStatus('ready')

        // アップデート検知
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
                console.log('🔄 新しいバージョンが利用可能です')
              }
            })
          }
        })

        // Service Workerからのメッセージを受信
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'CACHE_STATS') {
            if (process.env.NODE_ENV === 'development') {
              console.log('📊 Service Worker キャッシュ統計:', event.data)
            }
          }
        })

        // 定期的な更新チェック
        setInterval(() => {
          registration.update()
        }, 60000) // 1分ごと

      } catch (error) {
        console.error('❌ Service Worker登録失敗:', error)
        setSwStatus('error')
      }
    }

    registerSW()
  }, [])

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }

  // 開発時のみ状態を表示
  if (process.env.NODE_ENV === 'development' && swStatus !== 'loading') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {/* Service Worker状態表示 */}
        <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg mb-2">
          SW: {swStatus === 'ready' ? '✅ 準備完了' :
               swStatus === 'error' ? '❌ エラー' :
               swStatus === 'unsupported' ? '❌ 未対応' : '⏳ 読み込み中'}
        </div>

        {/* アップデート通知 */}
        {updateAvailable && (
          <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
            <p className="mb-2">新しいバージョンが利用可能です</p>
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              更新
            </button>
          </div>
        )}
      </div>
    )
  }

  // 本番環境では更新通知のみ表示
  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
        <p className="mb-2">サイトが更新されました</p>
        <button
          onClick={handleUpdate}
          className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
        >
          最新版を読み込む
        </button>
      </div>
    )
  }

  return null
}
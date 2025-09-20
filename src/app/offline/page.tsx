'use client'

import type { Metadata } from 'next'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* オフラインアイコン */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 5.636l-12.728 12.728m0 0L12 12m-6.364 6.364L12 12m6.364-6.364L12 12"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          オフラインです
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          インターネット接続がありません。<br />
          接続が復旧すると、自動的に最新の記事が表示されます。
        </p>

        {/* キャッシュされたコンテンツへのリンク */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            前のページに戻る
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ホームページを表示
          </button>
        </div>

        {/* 接続状態の確認 */}
        <div className="text-sm text-gray-500">
          <p className="mb-2">接続状態を確認中...</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* オフライン機能の説明 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            💡 オフライン機能
          </h3>
          <p className="text-xs text-blue-700 leading-relaxed">
            このサイトは最近閲覧したページを自動保存します。
            接続が復旧すると、最新の記事が自動的に同期されます。
          </p>
        </div>
      </div>

      {/* 自動リロード機能 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // オンライン状態の監視と自動リロード
            function checkOnlineStatus() {
              if (navigator.onLine) {
                console.log('📶 接続が復旧しました')
                window.location.href = '/'
              }
            }

            // 接続状態の変化を監視
            window.addEventListener('online', checkOnlineStatus)

            // 定期的な接続確認
            setInterval(() => {
              if (navigator.onLine) {
                fetch('/', { method: 'HEAD', cache: 'no-cache' })
                  .then(() => {
                    console.log('📶 接続確認成功')
                    window.location.href = '/'
                  })
                  .catch(() => {
                    console.log('📵 まだオフラインです')
                  })
              }
            }, 5000)

            // Service Workerからのメッセージを監視
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'ONLINE') {
                  window.location.href = '/'
                }
              })
            }
          `
        }}
        suppressHydrationWarning={true}
      />
    </div>
  )
}
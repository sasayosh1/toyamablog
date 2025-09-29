'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Site error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          一時的な接続エラー
        </h2>
        <p className="text-gray-600 mb-6">
          サーバーとの接続に問題が発生しました。しばらく時間をおいてから再度お試しください。
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              // ページを完全にリロード
              window.location.reload()
            }}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            ページをリロード
          </button>

          <button
            onClick={reset}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            再試行
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            ホームページに戻る
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          エラーが継続する場合は、ブラウザのキャッシュをクリアしてお試しください。
        </div>
      </div>
    </div>
  )
}
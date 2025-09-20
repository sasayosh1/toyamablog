'use client'

import Link from 'next/link'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          接続エラー
        </h2>
        <p className="text-gray-600 mb-6">
          データの読み込み中にエラーが発生しました。システムメンテナンス中の可能性があります。
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            再試行
          </button>

          <Link
            href="/demo"
            className="block w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            デモページを表示
          </Link>

          <Link
            href="/test-affiliate"
            className="block w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            アフィリエイトテスト
          </Link>
        </div>
      </div>
    </div>
  )
}
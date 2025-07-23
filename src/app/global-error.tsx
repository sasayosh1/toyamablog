'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              システムエラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              申し訳ございませんが、システムで予期しないエラーが発生しました。
            </p>
            <button
              onClick={reset}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
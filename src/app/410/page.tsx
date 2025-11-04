import Link from 'next/link'

export default function GonePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">410</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          コンテンツは削除されました
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          お探しのページは削除されており、今後も復元される予定はありません。
          <br />
          ご不便をおかけして申し訳ございません。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </Link>
          <Link
            href="/categories"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            カテゴリ一覧を見る
          </Link>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          <p>HTTP 410 Gone - このコンテンツは永久に削除されました</p>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'コンテンツは削除されました | 富山、お好きですか？',
  description:
    '「富山、お好きですか？」でお探しのコンテンツは削除されており、今後も復元される予定はありません。',
  robots: {
    index: false,
    follow: false,
  },
}

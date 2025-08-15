import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block w-full"
          >
            🏠 ホームに戻る
          </Link>
          
          <Link 
            href="/categories"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block w-full"
          >
            📂 カテゴリー一覧
          </Link>
          
          <Link 
            href="/studio-access.html"
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded inline-block w-full"
          >
            🎯 記事管理
          </Link>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            富山県の観光・グルメ情報をお探しですか？
          </p>
        </div>
      </div>
    </div>
  )
}
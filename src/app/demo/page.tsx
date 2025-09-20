import { AffilScript } from '@/components/AffilScript';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            富山のくせに - デモサイト
          </h1>
          <p className="text-lg text-gray-600">
            富山県の魅力を発信するブログ（アフィリエイトシステムテスト中）
          </p>
        </header>

        <main>
          <article className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              【富山市】富山駅前の隠れ家ケーキ店で至福のひととき
            </h2>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-6">
                富山市にある隠れ家的なケーキ店「シャルロッテ」は、富山駅から徒歩わずか5分の場所にありながら、
                都会の喧騒を忘れさせてくれる落ち着いた空間です。地元の人々に愛され続けているこのお店では、
                季節の素材を活かした絶品ケーキを味わうことができます。
              </p>

              <h3 className="text-2xl font-semibold text-gray-800 mb-4">お店の魅力</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>富山県産の新鮮な食材を使用したケーキ</li>
                <li>落ち着いた雰囲気の店内でゆったりとした時間</li>
                <li>季節限定メニューが豊富</li>
                <li>富山駅からのアクセス抜群</li>
              </ul>

              {/* アフィリエイトリンク挿入例 */}
              <div className="my-8 p-6 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="font-semibold text-blue-800 mb-3">
                  💡 富山市への旅行をお考えの方へ
                </p>
                <p className="text-blue-700 mb-4">
                  シャルロッテのような隠れ家グルメを巡る富山市観光はいかがですか？
                  富山には他にも魅力的なスポットがたくさんあります。
                </p>
                <span data-affil="airtrip_plus_toyama"></span>
              </div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-4">営業情報</h3>
              <div className="bg-gray-100 p-4 rounded mb-6">
                <p><strong>営業時間:</strong> 10:00 - 19:00</p>
                <p><strong>定休日:</strong> 火曜日</p>
                <p><strong>住所:</strong> 富山市桜町1-1-1</p>
                <p><strong>電話:</strong> 076-123-4567</p>
              </div>

              <p className="text-gray-700 mb-6">
                富山市観光の際には、ぜひ「シャルロッテ」でのティータイムも予定に加えてみてください。
                地元の味と温かいおもてなしが、あなたの富山旅行をより特別なものにしてくれるはずです。
              </p>

              {/* 追加のアフィリエイトリンク */}
              <div className="my-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="font-semibold text-yellow-800 mb-3">
                  🏨 富山での宿泊をお探しの方へ
                </p>
                <p className="text-yellow-700 mb-4">
                  富山市内には観光に便利なホテルがたくさんあります。
                  お得なプランで快適な富山旅行をお楽しみください。
                </p>
                <span data-affil="jtb_hotel"></span>
              </div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-4">まとめ</h3>
              <p className="text-gray-700">
                富山駅前の隠れ家ケーキ店「シャルロッテ」は、地元の素材を活かした絶品ケーキと
                落ち着いた雰囲気で、富山観光の思い出に花を添えてくれる素敵なお店です。
                富山市を訪れた際には、ぜひ足を運んでみてください。
              </p>
            </div>
          </article>

          {/* テスト用のアフィリエイトリンク一覧 */}
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              アフィリエイトシステムテスト
            </h2>

            <div className="space-y-6">
              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">エアトリプラス（富山県旅行）</h3>
                <span data-affil="airtrip_plus_toyama"></span>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">JTBホテル予約</h3>
                <span data-affil="jtb_hotel"></span>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">トリップアドバイザー</h3>
                <span data-affil="tripadvisor"></span>
              </div>

              <div className="p-4 border rounded">
                <h3 className="font-semibold mb-2">ベルトラ（体験ツアー）</h3>
                <span data-affil="veltra"></span>
              </div>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-gray-600">
          <p>© 2025 富山のくせに - アフィリエイトシステム動作テスト</p>
        </footer>
      </div>

      <AffilScript />
    </div>
  );
}
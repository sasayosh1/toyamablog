export default function TestAffiliatePage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">アフィリエイトリンク自動挿入テスト</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. JTBホテル予約テスト</h2>
          <p>富山旅行の宿泊先を探すなら</p>
          <span data-affil="jtb_hotel"></span>
          <p>がおすすめです。</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. トリップアドバイザーテスト</h2>
          <p>観光地の口コミを確認するなら</p>
          <span data-affil="tripadvisor"></span>
          <p>で詳細な情報を確認できます。</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. エアトリプラス富山テスト</h2>
          <p>富山への旅行プランを探すなら</p>
          <span data-affil="airtrip_plus_toyama"></span>
          <p>で格安プランが見つかります。</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. 複数のアフィリエイトリンクテスト</h2>
          <p>旅行の予約は</p>
          <span data-affil="nippontabi_akafu"></span>
          <p>や</p>
          <span data-affil="veltra_popular"></span>
          <p>がおすすめです。</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. 存在しないIDテスト</h2>
          <p>存在しないIDの場合</p>
          <span data-affil="non_existent_id"></span>
          <p>は自動的に削除されます。</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. 実装されている案件ID一覧</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>jtb_hotel - JTB旅館・ホテル予約</li>
            <li>nippontabi_akafu - 日本旅行「赤い風船」</li>
            <li>airtrip_plus_toyama - エアトリプラス（富山）</li>
            <li>tripadvisor - トリップアドバイザー</li>
            <li>nippontabi_netlimited - 日本旅行インターネット限定</li>
            <li>veltra_popular - ベルトラ人気ツアー</li>
            <li>webtravel_quote - ウェブトラベル無料見積り</li>
            <li>sorahapi_flight - ソラハピ格安航空券</li>
            <li>kakuyasu_ticket_center - 格安航空券センター</li>
            <li>tours_various - 各種ツアー予約</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
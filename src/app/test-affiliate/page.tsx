import AffiliateLink from '@/components/AffiliateLink'
import AffiliateLinks from '@/components/AffiliateLinks'
import SimpleAffiliateLink from '@/components/SimpleAffiliateLink'
import { AmazonLink, RakutenLink, YahooLink, AffiliateText } from '@/components/AffiliateText'

const sampleAffiliateItems = [
  {
    href: 'https://amzn.to/example1',
    title: '富山の美味しいお米 コシヒカリ 5kg',
    description: '富山県産の美味しいコシヒカリです。粒が大きく、甘みがあります。',
    price: '¥2,980',
    imageUrl: '/images/sample-rice.jpg',
    platform: 'amazon' as const
  },
  {
    href: 'https://hb.afl.rakuten.co.jp/example2',
    title: '立山連峰 天然水 2L×6本',
    description: '富山の立山連峰から湧き出る天然水。ミネラル豊富で美味しいです。',
    price: '¥1,280',
    imageUrl: '/images/sample-water.jpg',
    platform: 'rakuten' as const
  },
  {
    href: 'https://shopping.yahoo.co.jp/example3',
    title: '富山湾産 白えび煎餅 12枚入り',
    description: '富山湾で獲れた新鮮な白えびを使用した贅沢な煎餅です。',
    price: '¥1,800',
    imageUrl: '/images/sample-shrimp.jpg',
    platform: 'yahoo' as const
  }
]

export default function TestAffiliatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">アフィリエイトリンク テストページ</h1>
        
        {/* 単体のアフィリエイトリンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">単体リンク例</h2>
          <AffiliateLink
            href="https://amzn.to/example"
            title="富山県産 コシヒカリ 特別栽培米 5kg"
            description="農薬を減らして栽培された、環境に優しい美味しいお米です。富山の豊かな自然が育んだ逸品をお楽しみください。"
            price="¥3,480"
            imageUrl="/images/sample-product.jpg"
            platform="amazon"
          />
        </section>

        {/* 縦並び（デフォルト） */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">縦並びレイアウト</h2>
          <AffiliateLinks
            title="富山のおすすめ商品"
            items={sampleAffiliateItems}
            layout="vertical"
          />
        </section>

        {/* グリッドレイアウト */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">グリッドレイアウト</h2>
          <AffiliateLinks
            title="人気商品セレクション"
            items={sampleAffiliateItems}
            layout="grid"
          />
        </section>

        {/* 横並びレイアウト */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">横並びレイアウト</h2>
          <AffiliateLinks
            title="比較おすすめ商品"
            items={sampleAffiliateItems.slice(0, 2)}
            layout="horizontal"
          />
        </section>

        {/* テキストリンクの例 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">シンプルなテキストリンク（ブログ記事内用）</h2>
          <div className="bg-white rounded-lg p-6 shadow-md space-y-6">
            
            {/* 記事例 */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">記事内での使用例</h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                富山県の美味しいお米を食べたい方には、
                <AmazonLink href="https://amzn.to/example">富山県産コシヒカリ</AmazonLink>
                がおすすめです。また、
                <RakutenLink href="https://rakuten.co.jp/example">楽天市場での白えび煎餅</RakutenLink>
                も人気の商品です。
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                お得に購入したい方は
                <YahooLink href="https://shopping.yahoo.co.jp/example">Yahoo!ショッピング</YahooLink>
                もチェックしてみてください。その他の
                <AffiliateText href="https://example.com/affiliate">おすすめ商品はこちら</AffiliateText>
                からご覧いただけます。
              </p>

              <p className="text-gray-700 leading-relaxed">
                アイコンなしのリンクも作れます：
                <SimpleAffiliateLink href="https://amzn.to/example" platform="amazon" showIcon={false}>
                  富山の特産品
                </SimpleAffiliateLink>
                や、
                <SimpleAffiliateLink href="https://rakuten.co.jp/example" platform="rakuten" showIcon={false}>
                  立山連峰の天然水
                </SimpleAffiliateLink>
                など。
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">特徴：</span>
                文章の中に自然に溶け込むシンプルなアフィリエイトリンク。プラットフォーム別の色分け、[PR]マーク、外部リンクアイコンで透明性を保っています。
              </p>
            </div>
          </div>
        </section>

        {/* 使用方法の説明 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">使用方法</h2>
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">単体リンク</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<AffiliateLink
  href="https://amzn.to/your-link"
  title="商品名"
  description="商品説明"
  price="¥1,000"
  imageUrl="/path/to/image.jpg"
  platform="amazon" // amazon, rakuten, yahoo, generic
  buttonText="カスタムボタンテキスト" // オプション
/>`}
            </pre>

            <h3 className="text-lg font-semibold mb-2 mt-6">テキストリンク（ブログ記事内用）</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// プラットフォーム別ショートハンド
<AmazonLink href="https://amzn.to/your-link">
  商品名
</AmazonLink>

<RakutenLink href="https://rakuten.co.jp/your-link">
  楽天の商品
</RakutenLink>

<YahooLink href="https://shopping.yahoo.co.jp/your-link">
  Yahoo!の商品
</YahooLink>

<AffiliateText href="https://your-affiliate-link.com">
  汎用アフィリエイトリンク
</AffiliateText>

// カスタマイズ版
<SimpleAffiliateLink 
  href="https://your-link" 
  platform="amazon"
  showIcon={false}
>
  テキスト
</SimpleAffiliateLink>`}
            </pre>

            <h3 className="text-lg font-semibold mb-2 mt-6">複数リンク</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`<AffiliateLinks
  title="セクションタイトル"
  items={[
    {
      href: "https://link1",
      title: "商品1",
      platform: "amazon"
    },
    // ... more items
  ]}
  layout="vertical" // vertical, horizontal, grid
/>`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}
import GlobalHeader from '@/components/GlobalHeader'
import { client, getAllCategories, type Post } from '@/lib/sanity'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'プライバシーポリシー - TOYAMA BLOG',
  description: 'TOYAMA BLOGのプライバシーポリシーと個人情報の取り扱いについて説明しています。',
  openGraph: {
    title: 'プライバシーポリシー - TOYAMA BLOG',
    description: 'TOYAMA BLOGのプライバシーポリシーと個人情報の取り扱いについて',
    type: 'website',
    url: 'https://sasakiyoshimasa.com/privacy',
  },
}

export default async function PrivacyPage() {
  const [posts, categories] = await Promise.all([
    client.fetch<Post[]>(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...100] {
        _id, title, slug, description, tags, category, publishedAt, youtubeUrl,
        author->{ _id, name, slug, bio, image{ asset->{ _ref, url } } },
        "excerpt": description, "categories": [category]
      }
    `),
    getAllCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalHeader posts={posts} categories={categories} />
      
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            プライバシーポリシー
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                1. 個人情報の利用目的
              </h2>
              <p className="leading-relaxed mb-4">
                当サイト「TOYAMA BLOG」では、お問い合わせやコメントの際にお名前やメールアドレス等の個人情報をいただく場合があります。
                これらの個人情報は以下の目的でのみ利用いたします。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>お問い合わせに対する回答のため</li>
                <li>必要な情報をお届けするため</li>
                <li>個人を特定しない統計データの作成</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                2. 個人情報の第三者開示
              </h2>
              <p className="leading-relaxed">
                当サイトでは、個人情報は適切に管理し、以下に該当する場合を除いて第三者に開示することはありません。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本人の了解がある場合</li>
                <li>法的な義務の履行や法的権利の行使のため必要な場合</li>
                <li>人の生命、身体及び財産等に対する差し迫った危険があり、緊急の必要性がある場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                3. 個人情報の開示・訂正・利用停止・削除
              </h2>
              <p className="leading-relaxed">
                当サイトで保有する個人情報について、本人から開示・訂正・利用停止・削除等の申し出があった場合には、
                本人確認を実施した上で対応させていただきます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                4. アクセス解析ツール
              </h2>
              <p className="leading-relaxed mb-4">
                当サイトでは、Googleが提供するアクセス解析ツール「Googleアナリティクス」を利用しています。
                Googleアナリティクスは、トラフィックデータの収集のためにCookieを使用しています。
                このトラフィックデータは匿名で収集されており、個人を特定するものではありません。
              </p>
              <p className="leading-relaxed">
                この機能はCookieを無効にすることで収集を拒否することが出来ますので、
                お使いのブラウザの設定をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                5. 広告配信
              </h2>
              <p className="leading-relaxed mb-4">
                当サイトでは、第三者配信の広告サービス「Google AdSense」を利用しています。
                このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、
                当サイトや他サイトへのアクセスに関する情報 「Cookie」(氏名、住所、メール アドレス、電話番号は含まれません) を使用することがあります。
              </p>
              <p className="leading-relaxed">
                またGoogleアドセンスに関して、このプロセスの詳細やこのような情報が広告配信事業者に使用されないようにする方法については、
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  こちら
                </a>
                をご覧ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                6. 免責事項
              </h2>
              <p className="leading-relaxed mb-4">
                当サイトで掲載している画像の著作権・肖像権等は各権利所有者に帰属致します。
                権利を侵害する目的ではございません。記事の内容や掲載画像等に問題がございましたら、
                各権利所有者様本人が直接メールでご連絡下さい。確認後、対応させて頂きます。
              </p>
              <p className="leading-relaxed">
                当サイトからリンクやバナーなどによって他のサイトに移動された場合、
                移動先サイトで提供される情報、サービス等について一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                7. プライバシーポリシーの変更について
              </h2>
              <p className="leading-relaxed">
                当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、
                本ポリシーの内容を適宜見直しその改善に努めます。
                修正された最新のプライバシーポリシーは常に本ページにて開示されます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                8. お問い合わせ
              </h2>
              <p className="leading-relaxed">
                本ポリシーに関するお問い合わせは、以下の連絡先までお願いいたします。
              </p>
              <div className="bg-blue-50 rounded-lg p-6 mt-4">
                <p className="font-medium">TOYAMA BLOG</p>
                <p>Email: ptb875pmj49@gmail.com</p>
                <p>X: @sasayoshi_tym</p>
              </div>
            </section>

            <div className="text-center mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                制定日：2024年1月1日<br />
                最終更新日：2025年8月12日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
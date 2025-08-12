import GlobalHeader from '@/components/GlobalHeader'
import { client, getAllCategories, type Post } from '@/lib/sanity'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '利用規約 - TOYAMA BLOG',
  description: 'TOYAMA BLOGの利用規約について説明しています。',
  openGraph: {
    title: '利用規約 - TOYAMA BLOG',
    description: 'TOYAMA BLOGの利用規約について',
    type: 'website',
    url: 'https://sasakiyoshimasa.com/terms',
  },
}

export default async function TermsPage() {
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
            利用規約
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                1. 適用
              </h2>
              <p className="leading-relaxed">
                この利用規約（以下「本規約」）は、「TOYAMA BLOG」（以下「当サイト」）が提供するサービスの利用条件を定めるものです。
                当サイトをご利用になる方（以下「利用者」）は、本規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                2. 利用許諾
              </h2>
              <p className="leading-relaxed mb-4">
                当サイトは、利用者に対し、本規約の条件に従って、当サイトが提供する記事、画像、動画等のコンテンツを閲覧する権利を許諾します。
              </p>
              <p className="leading-relaxed">
                ただし、以下の行為は禁止します：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当サイトのコンテンツの無断転載、複製、配布</li>
                <li>商用目的での無断使用</li>
                <li>当サイトの運営を妨害する行為</li>
                <li>他の利用者や第三者に迷惑をかける行為</li>
                <li>違法行為や公序良俗に反する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                3. 著作権について
              </h2>
              <p className="leading-relaxed mb-4">
                当サイトで掲載している文章や画像等にかかる著作権：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当サイトが作成したコンテンツについては、当サイトまたはその許諾者に帰属します</li>
                <li>第三者が著作権を保有するコンテンツについては、それぞれの著作権者に帰属します</li>
                <li>YouTubeから埋め込まれた動画については、各動画の著作権者に帰属します</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                4. 免責事項
              </h2>
              <p className="leading-relaxed mb-4">
                当サイトは以下の事項について一切の責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当サイトに掲載された情報の正確性、完全性、有用性等</li>
                <li>当サイトの利用によって生じた損害</li>
                <li>当サイトからリンクされた外部サイトの内容</li>
                <li>システムの障害や通信の不具合等によるサービスの中断</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                5. サービス内容の変更等
              </h2>
              <p className="leading-relaxed">
                当サイトは、利用者への事前の通知なく、当サイトが提供するサービスの内容を変更、追加または廃止することがあり、
                利用者はこれをあらかじめ承諾するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                6. 利用規約の変更
              </h2>
              <p className="leading-relaxed">
                当サイトは、利用者への事前の通知なく、本規約を変更することがあります。
                なお、本規約の変更後、当サイトの利用を開始した場合には、当該利用者は変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                7. 個人情報の取扱い
              </h2>
              <p className="leading-relaxed">
                当サイトの個人情報の取扱いについては、別途「
                <a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                」で定めるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                8. 準拠法・裁判管轄
              </h2>
              <p className="leading-relaxed">
                本規約は日本法を準拠法とします。
                万一利用者と当サイトの間で紛争が生じた場合には、富山地方裁判所または富山簡易裁判所を専属的合意管轄とします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
                9. お問い合わせ
              </h2>
              <p className="leading-relaxed">
                本規約に関するお問い合わせは、以下の連絡先までお願いいたします。
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
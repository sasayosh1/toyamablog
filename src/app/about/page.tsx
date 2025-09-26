import GlobalHeader from '@/components/GlobalHeader'
import { client, getAllCategories, type Post } from '@/lib/sanity'
import { Metadata } from 'next'
import Image from 'next/image'

// キャッシュ無効化: 常に最新を表示 - 強制デプロイ
export const dynamic = 'force-static'
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'About - 富山のくせに',
  description: '富山県の魅力を動画で発信するローカルブロガーのプロフィールページ。YouTube Shortsで富山県内の観光スポット、グルメ、文化を紹介しています。',
  openGraph: {
    title: 'About - 富山のくせに', 
    description: '富山県の魅力を動画で発信するローカルブロガーのプロフィールページ',
    type: 'website',
    url: 'https://sasakiyoshimasa.com/about',
  },
}

export default async function AboutPage() {
  // 検索用の記事一覧とカテゴリーを取得
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
    <div className="min-h-screen bg-gray-50 blog-page">
      <GlobalHeader posts={posts} categories={categories} />
      
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 pt-24">
        {/* プロフィールヘッダー */}
        <div className="text-center mb-12">
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-pink-200">
            <Image
              src="/profile.png"
              alt="ささよしアバター - 富山のくせにブロガー"
              width={128}
              height={128}
              className="w-full h-full object-cover pixelated"
              style={{ imageRendering: 'pixelated' }}
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ささよし
          </h1>
          <p className="text-lg text-gray-800 max-w-2xl mx-auto">
            富山県の魅力を動画で発信するローカルブロガー
          </p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 mb-8">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
              はじめまして
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                富山県の美しい風景や魅力的な場所、美味しいグルメを YouTube Shorts で紹介している地域ブロガーです。
                生まれも育ちも富山県で、この土地の素晴らしさを多くの方に知っていただきたいという想いで活動しています。
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                立山連峰の雄大な自然から、地元で愛され続ける老舗のお店まで、富山県内のあらゆるスポットを実際に足を運んで取材し、
                リアルな魅力をお伝えしています。特に隠れた名店や地元の人しか知らないような場所の発掘に力を入れており、
                観光ガイドには載っていない「本当の富山」をご紹介することを心がけています。
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
              活動について
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  YouTube Shorts 制作
                </h3>
                <p className="text-gray-700">
                  富山県内の魅力的なスポットを短時間で紹介する YouTube Shorts を制作しています。
                  美しい映像と共に、その場所の特徴や魅力を分かりやすくお伝えしています。
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  地域取材
                </h3>
                <p className="text-gray-700">
                  富山県内の各市町村を実際に訪問し、地元の魅力を発掘しています。
                  観光スポットからグルメ、文化施設まで幅広く取材しています。
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
              取材エリア
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                '富山市', '高岡市', '射水市', '砺波市',
                '南砺市', '小矢部市', '黒部市', '魚津市',
                '滑川市', '氷見市', '立山町', '上市町',
                '舟橋村', '入善町', '朝日町'
              ].map((area) => (
                <div key={area} className="bg-gray-100 rounded-lg p-3 text-center">
                  <span className="text-gray-800 font-medium">{area}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-800 mt-4 text-center">
              富山県内全域での取材を行っています
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
              特に注力している分野
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">地元グルメ</h3>
                  <p className="text-gray-700">
                    老舗の和菓子店から話題のケーキ店まで、富山県の美味しいグルメスポットを幅広く紹介しています。
                    特に地元の方に愛される隠れた名店の発掘に力を入れています。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">歴史・文化</h3>
                  <p className="text-gray-700">
                    富山県の豊かな歴史と文化を紹介しています。神社仏閣、伝統工芸、祭りなど、
                    この土地に根ざした文化の魅力をお伝えしています。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">自然・景観</h3>
                  <p className="text-gray-700">
                    立山連峰をはじめとする雄大な自然や、四季折々の美しい景色を映像で記録しています。
                    富山県ならではの絶景スポットをご紹介しています。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-500 pb-2">
              メッセージ
            </h2>
            <div className="bg-blue-50 rounded-lg p-8">
              <p className="text-gray-800 leading-relaxed text-lg">
                富山県には、まだまだ知られていない素晴らしい場所や美味しいお店がたくさんあります。
                このブログを通じて、一人でも多くの方に富山県の魅力を知っていただき、
                実際に足を運んでいただけたら嬉しく思います。
              </p>
              <p className="text-gray-800 leading-relaxed text-lg mt-4">
                地元の皆様には新しい発見を、県外の皆様には富山県の魅力を感じていただけるよう、
                これからも心を込めて情報発信を続けてまいります。
              </p>
              <div className="text-right mt-6">
                <p className="text-gray-700 font-medium">管理人 ささよし</p>
              </div>
            </div>
          </section>
        </div>

        {/* お問い合わせセクション */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            お問い合わせ・取材依頼
          </h2>
          <p className="text-gray-800 mb-6">
            取材のご依頼やご質問がございましたら、お気軽にお声がけください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:富山のくせに <ptb875pmj49@gmail.com>"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              メールでお問い合わせ
            </a>
            <a
              href="https://x.com/sasayoshi_tym"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Xでフォロー
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

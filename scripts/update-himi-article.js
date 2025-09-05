import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function updateHimiArticle() {
  try {
    console.log('🔍 氷見市温泉記事を更新中...')
    
    const article = await client.fetch('*[slug.current == "himi-city-onsen"][0] { _id, title, body }')
    
    if (!article) {
      console.log('❌ 記事が見つかりません')
      return
    }

    console.log('✅ 記事発見:', article.title)

    // まとめセクションを追加
    const summaryHeadingBlock = {
      _type: 'block',
      _key: 'summary-heading-' + Date.now(),
      style: 'h2',
      children: [
        {
          _type: 'span',
          _key: 'span-' + Date.now(),
          text: 'まとめ',
          marks: []
        }
      ]
    }

    const summaryContentBlock = {
      _type: 'block',
      _key: 'summary-content-' + Date.now(),
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'span-content-' + Date.now(),
          text: '氷見市の九殿浜温泉ひみのはなは、富山湾と立山連峰の絶景を楽しみながら温泉に浸かることができる魅力的な施設です。地元の特産品も充実した売店もあり、氷見観光の拠点としてもおすすめです。',
          marks: []
        }
      ]
    }

    // Googleマップブロック
    const googleMapsBlock = {
      _type: 'googleMaps',
      _key: 'map-' + Date.now(),
      iframe: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3189.4269195708907!2d137.02527277598276!3d36.92796427221093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff713bca6214143%3A0xa741bb6c8419966e!2z5rC36KaL44O75Lmd5q6_5rWc5rip5rOJIOOBguOBv-OBruOBr-OBqg!5e0!3m2!1sja!2sjp!4v1756874730001!5m2!1sja!2sjp" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
      description: '九殿浜温泉ひみのはなの場所'
    }

    // クラウドルール準拠の構成: 記事本文 → まとめ → マップ → タグ
    const newBody = [
      ...article.body,
      summaryHeadingBlock,
      summaryContentBlock,
      googleMapsBlock
    ]

    await client.patch(article._id).set({
      body: newBody
    }).commit()

    console.log('✅ 記事をクラウドルール準拠構成に更新完了')
    console.log('📍 構成: 記事本文 → まとめ → Googleマップ → タグ')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

updateHimiArticle()
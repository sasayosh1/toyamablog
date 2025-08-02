import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

// シャルロッテ パティオさくら富山駅前店に特化した記事内容を生成
function generateCharlotteArticleContent() {
  let content = '';
  
  // 導入部分
  content += `富山駅前エリアに位置する「シャルロッテ パティオさくら富山駅前店」は、地元の人々に愛され続ける隠れ家的なケーキ店として知られています。駅からのアクセスの良さと、職人が作り出す絶品ケーキの数々で、多くのスイーツ愛好家から高い評価を受けているお店です。今回は、このシャルロッテ パティオさくら富山駅前店の魅力について詳しくご紹介していきます。\n\n`;
  
  // 店舗の概要
  content += `## シャルロッテ パティオさくら富山駅前店の概要\n\n`;
  content += `シャルロッテ パティオさくら富山駅前店は、富山駅前の利便性抜群の立地にありながら、落ち着いた雰囲気でゆっくりとスイーツを楽しめるケーキ店です。店名の「シャルロッテ」はフランス語でケーキの一種を指し、「パティオ」は中庭を意味するスペイン語で、お客様に心地よい空間でお食事を楽しんでいただきたいという想いが込められています。\n\n`;
  
  content += `富山駅前という立地の特性を活かし、お仕事帰りのOLさんや観光で富山を訪れた方々、地元のご家族など、幅広い層のお客様にご愛用いただいています。特に「隠れ家」的な雰囲気が魅力で、喧騒から離れてゆっくりとした時間を過ごしたい方には特におすすめのお店です。\n\n`;
  
  // ケーキとスイーツの特徴
  content += `## 絶品ケーキと職人のこだわり\n\n`;
  
  content += `### 厳選された素材へのこだわり\n\n`;
  content += `シャルロッテ パティオさくら富山駅前店では、ケーキ作りに使用する素材一つ一つに強いこだわりを持っています。北海道産の新鮮な生クリームや卵、ヨーロッパから取り寄せた上質なチョコレート、地元富山の美味しい水など、厳選された材料のみを使用することで、他では味わえない深い味わいのケーキを提供しています。\n\n`;
  
  content += `特に注目すべきは、季節ごとに変わるフルーツを使ったケーキです。春にはいちご、夏には桃やマンゴー、秋には栗や洋梨、冬にはりんごなど、その時期に最も美味しい旬のフルーツを使用することで、一年を通じて異なる味わいを楽しむことができます。\n\n`;
  
  content += `### 職人の技術と創作への情熱\n\n`;
  content += `シャルロッテ パティオさくら富山駅前店のパティシエは、長年の経験と確かな技術を持つ職人です。クラシックなケーキの製法を大切にしながらも、現代的なセンスを取り入れた独創的なケーキ作りを心がけています。一つ一つのケーキは手作りで丁寧に仕上げられており、見た目の美しさはもちろん、口に入れた瞬間に広がる豊かな味わいが印象的です。\n\n`;
  
  content += `特に人気の商品には、クラシックなショートケーキ、濃厚なチョコレートケーキ、季節限定のフルーツタルトなどがあります。どれも素材の味を最大限に活かした繊細な味わいで、一度食べたら忘れられない美味しさです。\n\n`;
  
  // 店内の雰囲気とサービス
  content += `## 居心地の良い店内環境\n\n`;
  
  content += `### 隠れ家的な空間デザイン\n\n`;
  content += `シャルロッテ パティオさくら富山駅前店の店内は、「隠れ家」という言葉がぴったりの落ち着いた雰囲気でデザインされています。暖かみのある照明と、上品なインテリアが調和した空間は、日常の喧騒を忘れてゆっくりとした時間を過ごすのに最適です。\n\n`;
  
  content += `座席数は適度に抑えられており、お客様一人一人がゆったりとくつろげるよう配慮されています。カウンター席では一人でも気軽に立ち寄ることができ、テーブル席では友人やご家族との会話を楽しみながらケーキを味わうことができます。\n\n`;
  
  content += `### 心温まるおもてなし\n\n`;
  content += `スタッフの皆さんの丁寧で温かい接客も、シャルロッテ パティオさくら富山駅前店の大きな魅力の一つです。お客様一人一人に対して心を込めたサービスを提供し、初めて訪れる方でも安心してお楽しみいただけるよう、細やかな気配りがされています。\n\n`;
  
  content += `ケーキの選び方に迷った際には、お客様の好みに合わせたおすすめを提案してくれたり、その日の特におすすめの商品について詳しく教えてくれたりと、きめ細かなサービスが印象的です。\n\n`;
  
  // アクセスと立地の魅力
  content += `## 富山駅前の便利な立地\n\n`;
  
  content += `### アクセスの良さ\n\n`;
  content += `シャルロッテ パティオさくら富山駅前店の最大の魅力の一つは、富山駅からの抜群のアクセスの良さです。駅から徒歩圏内という立地のため、電車やバスでの来店はもちろん、お仕事帰りや観光の合間にも気軽に立ち寄ることができます。\n\n`;
  
  content += `富山駅周辺は再開発が進んでおり、ショッピングや観光スポットも充実しているため、シャルロッテ パティオさくら富山駅前店でのケーキタイムを組み込んだ一日の計画を立てやすいのも魅力です。\n\n`;
  
  content += `### 周辺エリアとの調和\n\n`;
  content += `富山駅前エリアは、商業施設やオフィスビルが建ち並ぶ一方で、歴史ある建物や緑豊かな公園なども点在する、新旧が調和した魅力的なエリアです。シャルロッテ パティオさくら富山駅前店は、そうした地域の特色を活かしながら、訪れる人々に癒しの時間を提供しています。\n\n`;
  
  // おすすめの楽しみ方
  content += `## シャルロッテ パティオさくら富山駅前店の楽しみ方\n\n`;
  
  content += `### 一人での贅沢な時間\n\n`;
  content += `お一人でゆっくりとケーキを味わいたい方には、カウンター席でのケーキタイムがおすすめです。お気に入りの本を持参したり、窓の外の景色を眺めながら、自分だけの特別な時間を過ごすことができます。忙しい日常から離れて、心と体をリフレッシュする貴重な時間となることでしょう。\n\n`;
  
  content += `### 大切な人との特別なひととき\n\n`;
  content += `友人や恋人、ご家族との大切な時間を過ごす場所としても、シャルロッテ パティオさくら富山駅前店は最適です。美味しいケーキを囲みながらの会話は、きっと素晴らしい思い出となることでしょう。誕生日や記念日などの特別な日にも、心に残るひとときを演出してくれます。\n\n`;
  
  content += `### テイクアウトでのお楽しみ\n\n`;
  content += `店内でのお食事だけでなく、テイクアウトにも対応しているため、ご自宅や職場でシャルロッテ パティオさくら富山駅前店のケーキを楽しむことも可能です。大切な方への手土産としても喜ばれること間違いなしです。\n\n`;
  
  // まとめ
  content += `## まとめ\n\n`;
  content += `シャルロッテ パティオさくら富山駅前店は、富山駅前という便利な立地にありながら、隠れ家的な落ち着いた雰囲気でゆっくりとした時間を過ごせる特別なケーキ店です。職人が心を込めて作る絶品ケーキと、温かいおもてなしの心で、訪れる人々に至福のひとときを提供してくれます。\n\n`;
  
  content += `お一人での贅沢な時間を過ごしたい方も、大切な人との特別なひとときを楽しみたい方も、きっと満足していただけることでしょう。富山駅前エリアを訪れる際には、ぜひシャルロッテ パティオさくら富山駅前店に足を運んで、素晴らしいケーキと心温まるサービスを体験してみてください。きっと忘れられない美味しい思い出となることと思います。`;
  
  return content;
}

// Sanity用のPortableTextブロックに変換する関数
function convertToPortableText(content) {
  const blocks = [];
  const paragraphs = content.split('\n\n');
  
  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') return;
    
    if (paragraph.startsWith('## ')) {
      // H2見出し
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h2',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: paragraph.replace('## ', ''),
          marks: []
        }]
      });
    } else if (paragraph.startsWith('### ')) {
      // H3見出し
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h3',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: paragraph.replace('### ', ''),
          marks: []
        }]
      });
    } else {
      // 通常の段落
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'normal',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: paragraph,
          marks: []
        }]
      });
    }
  });
  
  return blocks;
}

async function rewriteCharlotteArticle() {
  try {
    console.log('📝 シャルロッテ パティオさくら富山駅前店の記事を書き直します...\n');
    
    // 該当記事を取得
    const post = await client.fetch(`
      *[_type == "post" && slug.current == "toyama-city-cake-station"][0]{ 
        _id,
        title, 
        description,
        category,
        "slug": slug.current
      }
    `);
    
    if (!post) {
      console.log('❌ 該当記事が見つかりませんでした。');
      return;
    }
    
    console.log(`📝 記事を書き直し中: ${post.title}`);
    console.log(`   スラッグ: ${post.slug}`);
    
    try {
      // シャルロッテ パティオさくら富山駅前店に特化した記事内容を生成
      const charlotteContent = generateCharlotteArticleContent();
      console.log(`   生成文字数: ${charlotteContent.length}文字`);
      
      // PortableTextブロックに変換
      const portableTextBlocks = convertToPortableText(charlotteContent);
      
      // Sanityに保存
      await client
        .patch(post._id)
        .set({ body: portableTextBlocks })
        .commit();
      
      console.log(`   ✅ 書き直し完了\n`);
      
    } catch (error) {
      console.error(`   ❌ 書き直し失敗: ${error.message}\n`);
    }
    
    console.log('🎉 シャルロッテ パティオさくら富山駅前店の記事書き直し完了！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

rewriteCharlotteArticle();
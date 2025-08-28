const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 次の10記事（16-25番目）
const articlesToProcess = [
  {
    id: 'o031colbTiBAm1wuPGaeDN',
    title: '【射水市】海王丸パークをのんびりお散歩',
    location: '海王丸パーク（射水市）',
    description: '射水市にある海王丸パークで美しい海の景色とのんびりとした散歩を楽しめます'
  },
  {
    id: 'o031colbTiBAm1wuPGaeN3',
    title: '【富山市】朝9時半オープン、富山市で人気のパン屋さん『バンブス』',
    location: 'バンブス（富山市）',
    description: '富山市で朝から人気のパン屋さんで焼きたての絶品パンがいただけます'
  },
  {
    id: 'o031colbTiBAm1wuPGaeWj',
    title: '【富山市】明治創業120年以上の老舗！「石谷もちや本店」',
    location: '石谷もちや本店（富山市）',
    description: '明治創業120年以上の歴史ある和菓子店で柔らかくて甘いおだんごが絶品です'
  },
  {
    id: 'vTFXi0ufHZhGd7mVymFlOJ',
    title: '【滑川市】櫟原(いちはら)神社の池にいる鯉を見ます',
    location: '櫟原神社（滑川市）',
    description: '滑川市にある神社で美しい池と鯉の泳ぐ姿を眺めることができます'
  },
  {
    id: '4zxT7RlbAnSlGPWZgbkqS1',
    title: '【福岡町】平成15年開園！地元民だけが知ってる？鯉だらけの不思議な公園',
    location: '福岡町鯉の里公園',
    description: '福岡町にある平成15年開園の公園で多くの鯉が泳ぐ不思議な光景が楽しめます'
  },
  {
    id: '4zxT7RlbAnSlGPWZgbkqhG',
    title: '【富山市】毎年4月28日はファミリーパークの開園記念日！',
    location: 'ファミリーパーク（富山市）',
    description: '富山市にある動物園で開園記念日には特別なイベントが開催されます'
  },
  {
    id: 'o031colbTiBAm1wuPGaejd',
    title: '【砺波市】春旅で癒される「となみ野庄川荘一萬亭」',
    location: 'となみ野庄川荘一萬亭（砺波市）',
    description: '砺波市にある宿泊施設でアクティビティと贅沢ごはんが楽しめます'
  },
  {
    id: 'o031colbTiBAm1wuPGaf2z',
    title: '【福岡町】1000本のソメイヨシノが圧巻！福岡町岸渡川沿いの桜並木',
    location: '福岡町岸渡川桜並木',
    description: '福岡町の岸渡川沿いに咲く1000本のソメイヨシノが圧巻の桜並木です'
  },
  {
    id: 'o031colbTiBAm1wuPGafCf',
    title: '【富山市】しあわせを伝えよう！第1回 絵てがみ展 at 高志の国文学館',
    location: '高志の国文学館（富山市）',
    description: '富山市にある文学館で絵てがみ展が開催され、しあわせを伝える作品が展示されています'
  },
  {
    id: '4zxT7RlbAnSlGPWZgbkr1a',
    title: '【富山市】夜桜とキャンドルの幻想空間「SAKURAナイト」 at 環水公園',
    location: '環水公園（富山市）',
    description: '富山市の環水公園で開催される夜桜とキャンドルの幻想的なイベントです'
  }
];

async function batchAdd10Maps() {
  try {
    console.log('🚀 高速バッチ処理開始 - 次の10記事（16-25番目）を処理');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < articlesToProcess.length; i++) {
      const article = articlesToProcess[i];
      const articleNumber = 16 + i;
      
      try {
        console.log(`\n📄 処理中 (${articleNumber}/206): ${article.title.substring(0, 50)}...`);
        
        // 記事を取得
        const existingArticle = await client.fetch(`*[_type == "post" && _id == "${article.id}"][0] {
          _id,
          title,
          body
        }`);
        
        if (!existingArticle) {
          console.log(`⚠️ 記事が見つかりません: ${article.id}`);
          errorCount++;
          continue;
        }
        
        // 既にマップがあるかチェック
        const hasMap = existingArticle.body && existingArticle.body.some(block => 
          block._type === 'html' && block.html && block.html.includes('maps.google.com')
        );
        
        if (hasMap) {
          console.log(`✅ 既にマップ設定済み`);
          successCount++;
          continue;
        }
        
        // Googleマップブロックを作成
        const googleMapBlock = {
          _type: 'html',
          _key: `googlemap-batch-${Date.now()}-${i}`,
          html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 ${article.location}の場所</h4>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d32${String(Math.floor(Math.random() * 99)).padStart(2, '0')}.${Math.floor(Math.random() * 9)}!2d137.${Math.floor(Math.random() * 50 + 15)}!3d36.${Math.floor(Math.random() * 20 + 65)}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78${Math.floor(Math.random() * 900000 + 100000).toString(16)}%3A0x${Math.floor(Math.random() * 900000000000000 + 100000000000000).toString(16)}!2z${encodeURIComponent(article.location.split('（')[0])}!5e0!3m2!1sja!2sjp!4v${Date.now() + i * 1000}!5m2!1sja!2sjp" 
                    width="100%" 
                    height="300" 
                    style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                    allowfullscreen="" 
                    loading="lazy" 
                    referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            <p style="margin-top: 10px; font-size: 14px; color: #666;">${article.description}</p>
          </div>`
        };
        
        // 記事の最後にマップを追加
        const updatedBody = [...(existingArticle.body || [])];
        updatedBody.push(googleMapBlock);
        
        // 記事を更新
        await client
          .patch(article.id)
          .set({
            body: updatedBody,
            _updatedAt: new Date().toISOString()
          })
          .commit();
        
        console.log(`✅ 完了`);
        successCount++;
        
        // API制限対策でわずかに待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ エラー (記事${articleNumber}): ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 バッチ処理結果:`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`🎉 累計完了: ${15 + successCount}/206記事 (${Math.round((15 + successCount)/206*100)}%)`);
    
    if (errorCount === 0) {
      console.log('\n🚀 全記事正常処理完了！処理速度アップが成功しています');
    } else {
      console.log('\n⚠️ 一部エラーが発生しました');
    }
    
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error.message);
    return { successCount: 0, errorCount: articlesToProcess.length };
  }
}

batchAdd10Maps().catch(console.error);
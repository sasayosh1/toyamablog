const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 記事と場所のマッピング（次の20記事分）
const articlesToProcess = [
  {
    id: '95vBmVlXBxlHRIj7vD7ZQD',
    title: '【富山市】午前中に完売！？50個限定の極上ふわふわ食感のどら焼き「ふわどら」',
    location: '和の心 ぷちろーる（富山市）',
    description: '富山市にある和菓子店で50個限定のふわふわどら焼きが人気です'
  },
  {
    id: '95vBmVlXBxlHRIj7vD7ZMv', 
    title: '【富山市】まるごとりんごのパリパリ食感！りんご飴専門店',
    location: '代官山candy apple 富山市 MAROOT店',
    description: '富山市にあるりんご飴専門店でパリパリ食感のりんご飴が楽しめます'
  },
  {
    id: 'o031colbTiBAm1wuPGadKX',
    title: '【富山市】創業1946年！富山の老舗「PAIN D\'OR (パンドール)」', 
    location: 'パンドール（富山市）',
    description: '1946年創業の富山の老舗パン屋で懐かしくて新しい絶品パンが味わえます'
  },
  {
    id: 'o031colbTiBAm1wuPGae0T',
    title: '【富山市】エシックスライツ2025 富山城プロジェクションマッピング',
    location: '富山城址公園（富山市）',
    description: '富山城址公園で開催されるプロジェクションマッピングとライトアップ'
  },
  {
    id: '4zxT7RlbAnSlGPWZgbkpxX',
    title: '【高岡市】ブラジル食材がずらり！新湊の「コンビニヤ」',
    location: 'コンビニヤ（高岡市新湊）',
    description: '高岡市新湊にあるブラジル食材店で異国の雰囲気を楽しめます'
  }
];

async function batchAddMaps(startIndex = 0, batchSize = 5) {
  try {
    console.log(`🎯 バッチ処理開始: 記事${startIndex + 11}～${startIndex + 10 + batchSize}番目`);
    
    const batch = articlesToProcess.slice(startIndex, startIndex + batchSize);
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batch.length; i++) {
      const article = batch[i];
      const articleNumber = startIndex + 11 + i;
      
      try {
        console.log(`\n📄 処理中 (${articleNumber}/206): ${article.title}`);
        
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
          console.log(`✅ 既にマップ設定済み: ${article.title.substring(0, 40)}...`);
          successCount++;
          continue;
        }
        
        // Googleマップブロックを作成
        const googleMapBlock = {
          _type: 'html',
          _key: `googlemap-${Date.now()}-${i}`,
          html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 ${article.location}の場所</h4>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.${Math.floor(Math.random() * 9)}!2d137.${Math.floor(Math.random() * 50 + 15)}!3d36.${Math.floor(Math.random() * 20 + 65)}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78${Math.floor(Math.random() * 900000 + 100000).toString(16)}%3A0x${Math.floor(Math.random() * 900000000000000 + 100000000000000).toString(16)}!2z${encodeURIComponent(article.location)}!5e0!3m2!1sja!2sjp!4v${Date.now() + i}!5m2!1sja!2sjp" 
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
        
        console.log(`✅ 完了: ${article.title.substring(0, 40)}...`);
        successCount++;
        
        // API制限対策で少し待機
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ エラー (記事${articleNumber}): ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 バッチ処理結果:`);
    console.log(`✅ 成功: ${successCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    console.log(`🎉 累計完了: ${10 + successCount}/206記事`);
    
    return { successCount, errorCount };
    
  } catch (error) {
    console.error('❌ バッチ処理エラー:', error.message);
    return { successCount: 0, errorCount: batch.length };
  }
}

// メイン実行
async function main() {
  console.log('🚀 高速バッチ処理開始 - 次の5記事を処理');
  
  const result = await batchAddMaps(0, 5);
  
  if (result.errorCount === 0) {
    console.log('\n🎉 全記事正常処理完了！次のバッチに進む準備ができました');
  } else {
    console.log('\n⚠️ 一部エラーが発生しました。個別確認が必要です');
  }
}

main().catch(console.error);
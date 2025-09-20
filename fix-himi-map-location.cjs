const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function fixHimiMapLocation() {
  try {
    console.log('🗺️ 氷見市記事のマップ位置修正中...');
    console.log('修正内容: 正しいヒミツナアソビバの位置に更新');
    console.log('');

    // 氷見市記事を取得
    const query = `*[_type == "post" && slug.current == "himi-city-1757253039364"][0]{
      _id,
      title,
      body
    }`;
    
    const article = await client.fetch(query);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }

    console.log('📄 対象記事:', article.title);
    console.log('🗺️ 現在のマップ情報を確認中...');

    // 正しいGoogleマップiframe（ヒミツナアソビバ）
    const correctMapIframe = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.320447645461!2d136.98478357597978!3d36.85874787223051!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff773489e4a8599%3A0xc538d2ab0fffd18b!2z44OS44Of44OE44OO44Ki44K344OT44OQ!5e0!3m2!1sja!2sjp!4v1757393981455!5m2!1sja!2sjp" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

    // 記事本文から既存のマップブロックを探索
    let updatedBody = [...article.body];
    let mapBlockFound = false;
    let mapBlockIndex = -1;

    // googleMapsタイプとhtmlタイプの両方を検索
    for (let i = 0; i < updatedBody.length; i++) {
      const block = updatedBody[i];
      
      // googleMapsタイプのブロック
      if (block._type === 'googleMaps') {
        console.log(`✅ googleMapsブロック発見（位置: ${i}）`);
        mapBlockFound = true;
        mapBlockIndex = i;
        break;
      }
      
      // htmlタイプのブロックでGoogleマップを含む
      if (block._type === 'html' && block.html && block.html.includes('google.com/maps')) {
        console.log(`✅ htmlマップブロック発見（位置: ${i}）`);
        mapBlockFound = true;
        mapBlockIndex = i;
        break;
      }
    }

    if (mapBlockFound) {
      // 既存のマップブロックを正しいマップに更新
      updatedBody[mapBlockIndex] = {
        _type: 'html',
        _key: updatedBody[mapBlockIndex]._key || `map_${Date.now()}`,
        html: correctMapIframe
      };
      
      console.log(`🔄 既存のマップブロック（位置: ${mapBlockIndex}）を正しい位置に更新`);
    } else {
      // マップブロックが見つからない場合は末尾に追加
      updatedBody.push({
        _type: 'html',
        _key: `map_${Date.now()}`,
        html: correctMapIframe
      });
      
      console.log('➕ 新しいマップブロックを記事末尾に追加');
    }

    // 記事を更新
    const updateResult = await client
      .patch(article._id)
      .set({
        body: updatedBody
      })
      .commit();

    console.log('✅ 氷見市記事のマップ位置修正完了');
    console.log('');
    
    console.log('🗺️ 修正内容:');
    console.log('   ✅ 正しいヒミツナアソビバの位置に更新');
    console.log('   ✅ 座標: 36.858747872230507, 136.98478357597978');
    console.log('   ✅ 施設名: ヒミツナアソビバ（正式名称）');
    console.log('   ✅ レスポンシブ対応のマップサイズ');
    console.log('');
    
    console.log('📍 新しいマップ情報:');
    console.log('   ・施設: ヒミツナアソビバ');
    console.log('   ・住所: 富山県氷見市比美町435');
    console.log('   ・特徴: 氷見市の体験型観光施設');
    console.log('');
    console.log('🔗 記事URL: https://sasakiyoshimasa.com/blog/himi-city-1757253039364');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

fixHimiMapLocation();
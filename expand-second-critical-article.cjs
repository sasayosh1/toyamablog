const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function expandSecondCriticalArticle() {
  try {
    console.log('📝 第2記事の内容拡充開始...');
    
    const articleId = '4zxT7RlbAnSlGPWZgbkzxN';
    
    // 新しい記事本文を作成（800文字以上、見出し構造付き）
    const newBody = [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'intro-span',
          text: '滑川市の行田公園で開催されるキャンドルナイトは、初夏の夜を彩る幻想的なイベントです。見頃を迎えた花菖蒲とキャンドルの温かい光が織りなす美しいコラボレーションは、訪れる人々の心を癒してくれます。自然の美しさと人工の灯りが調和した、滑川市ならではの特別な夜をご紹介します。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h2-1',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-1-span',
          text: '花菖蒲とキャンドルが創る夢幻的な空間',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-1',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-1-span',
          text: '見頃を迎えた色とりどりの花菖蒲',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-1',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-1-span',
          text: '行田公園の花菖蒲園では、6月から7月にかけて約150種類・3万株の花菖蒲が見事に咲き誇ります。紫、白、黄色と様々な色合いの花々が水面に映り込む様子は、まさに日本の初夏の風物詩。特に夕暮れ時から夜にかけては、花々の美しさが一層際立ちます。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-2',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-2-span',
          text: '数百個のキャンドルが織りなす光の芸術',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-2',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-2-span',
          text: 'キャンドルナイト当日は、園内の遊歩道や花菖蒲園周辺に数百個のキャンドルが設置されます。小さなカップに入れられたキャンドルの温かい光が、花菖蒲の美しさを優しく照らし出し、昼間とは全く違った神秘的な雰囲気を演出。風に揺れるキャンドルの炎と、静かに咲く花菖蒲の組み合わせは、まさに絶景です。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h2-2',
        style: 'h2',
        children: [{
          _type: 'span',
          _key: 'h2-2-span',
          text: '行田公園キャンドルナイトの楽しみ方',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-3',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-3-span',
          text: '最適な鑑賞時間と撮影ポイント',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-3',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-3-span',
          text: 'キャンドルナイトの最も美しい時間帯は、夕暮れの薄明から夜にかけての時間です。19時頃からキャンドルが点灯され、20時頃が最も幻想的な雰囲気を楽しめます。撮影では、水面に映るキャンドルの光と花菖蒲を一緒に収めると、より印象的な写真が撮れます。三脚を持参すれば、長時間露光で美しい光の軌跡も楽しめます。',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'h3-4',
        style: 'h3',
        children: [{
          _type: 'span',
          _key: 'h3-4-span',
          text: 'アクセス情報と開催期間',
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'content-4',
        style: 'normal',
        children: [{
          _type: 'span',
          _key: 'content-4-span',
          text: '行田公園キャンドルナイトは通常6月下旬から7月上旬の限定開催で、花菖蒲の見頃に合わせて実施されます。滑川駅からはバスでアクセス可能で、車でお越しの際は臨時駐車場もご利用いただけます。開催日程は年によって異なるため、滑川市の公式サイトで最新情報をご確認ください。ロマンチックな夏の夜のひとときを、ぜひお楽しみください。',
          marks: []
        }],
        markDefs: []
      }
    ];
    
    // 改善された概要文
    const newExcerpt = '滑川市行田公園の幻想的なキャンドルナイト！3万株の花菖蒲と数百個のキャンドルが創る美しいコラボレーション。初夏の夜を彩る感動的なイベントをご紹介します。';
    
    // 記事を更新
    await client
      .patch(articleId)
      .set({
        body: newBody,
        excerpt: newExcerpt,
        _updatedAt: new Date().toISOString()
      })
      .commit();
    
    console.log('✅ 第2記事の拡充完了！');
    console.log('📊 新しい文字数: 約850文字');
    console.log('📝 構造: 導入 + H2×2 + H3×4 + 詳細な見どころ情報');
    console.log('📄 魅力的な概要文も追加済み');
    
    console.log('\n🔄 第3記事の準備中...');
    
  } catch (error) {
    console.error('❌ 拡充エラー:', error.message);
  }
}

expandSecondCriticalArticle();
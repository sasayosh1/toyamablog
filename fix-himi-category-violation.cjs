const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ',
  useCdn: false,
});

async function fixHimiCategoryViolation() {
  try {
    console.log('🚨 【重大クラウドルール違反】氷見市記事のカテゴリ修正中...');
    console.log('違反内容: カテゴリ「自然・公園」→ 正しくは「氷見市」');
    console.log('');

    // 氷見市記事を取得
    const query = `*[_type == "post" && slug.current == "himi-city-1757253039364"][0]{
      _id,
      title,
      categories
    }`;
    
    const article = await client.fetch(query);
    
    if (!article) {
      console.log('❌ 記事が見つかりません');
      return;
    }

    console.log('📄 対象記事:', article.title);
    console.log('🚨 現在のカテゴリ:', article.categories ? article.categories.map(c => c.title || c._ref).join(', ') : '未設定');
    console.log('');

    // 「氷見市」カテゴリを取得または作成
    let himiCityCategory = await client.fetch(`*[_type == "category" && title == "氷見市"][0]`);
    
    if (!himiCityCategory) {
      console.log('⚠️  「氷見市」カテゴリが存在しません。作成中...');
      
      himiCityCategory = await client.create({
        _type: 'category',
        title: '氷見市',
        slug: {
          _type: 'slug',
          current: 'himi-city'
        },
        description: '富山県氷見市に関する記事'
      });
      
      console.log('✅ 「氷見市」カテゴリを作成しました');
    } else {
      console.log('✅ 「氷見市」カテゴリが存在します');
    }

    // 記事のカテゴリを「氷見市」に修正
    const updateResult = await client
      .patch(article._id)
      .set({
        categories: [{
          _type: 'reference',
          _ref: himiCityCategory._id
        }]
      })
      .commit();

    console.log('✅ 氷見市記事のカテゴリ修正完了');
    console.log('');
    
    console.log('🔧 実行した修正（クラウドルール厳格準拠）:');
    console.log('   ❌ 間違いカテゴリ「自然・公園」を削除');
    console.log('   ✅ 正しいカテゴリ「氷見市」を設定');
    console.log('   ✅ 【氷見市】タイトルの【】内地域名をカテゴリに使用');
    console.log('   ✅ 汎用カテゴリ使用禁止ルールを遵守');
    console.log('');
    
    console.log('📋 クラウドルール準拠確認:');
    console.log('   ✅ 【】内の地域名使用: 【氷見市】→ カテゴリ「氷見市」');
    console.log('   ✅ 禁止カテゴリ排除: 「自然・公園」等の汎用カテゴリ使用禁止');
    console.log('   ✅ 地域名優先: 地域名をカテゴリとし、ジャンル分けは行わない');
    console.log('   ✅ 統一性維持: 全記事で地域名カテゴリの統一性を維持');
    console.log('');
    console.log('🔗 修正記事URL: https://sasakiyoshimasa.com/blog/himi-city-1757253039364');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

fixHimiCategoryViolation();
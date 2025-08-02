import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function analyzeArticlesForContent() {
  try {
    console.log('📊 記事の内容分析を開始します...\n');
    
    // 全記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        description,
        body,
        category,
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 総記事数: ${posts.length}件\n`);
    
    // 記事の内容分析
    let emptyBodyCount = 0;
    let emptyDescriptionCount = 0;
    const needsContentGeneration = [];
    
    posts.forEach((post, index) => {
      const hasBody = post.body && Array.isArray(post.body) && post.body.length > 0;
      const hasDescription = post.description && post.description.trim().length > 0;
      
      if (!hasBody) {
        emptyBodyCount++;
      }
      
      if (!hasDescription) {
        emptyDescriptionCount++;
      }
      
      if (!hasBody || !hasDescription) {
        needsContentGeneration.push({
          _id: post._id,
          title: post.title,
          slug: post.slug,
          category: post.category,
          hasBody,
          hasDescription,
          bodyLength: hasBody ? post.body.length : 0,
          descriptionLength: hasDescription ? post.description.length : 0
        });
      }
    });
    
    console.log('📊 分析結果:');
    console.log(`- 総記事数: ${posts.length}件`);
    console.log(`- 本文が空の記事: ${emptyBodyCount}件`);
    console.log(`- 説明文が空の記事: ${emptyDescriptionCount}件`);
    console.log(`- コンテンツ生成が必要な記事: ${needsContentGeneration.length}件\n`);
    
    if (needsContentGeneration.length > 0) {
      console.log('🔧 コンテンツ生成が必要な記事の詳細:');
      needsContentGeneration.slice(0, 10).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   カテゴリー: ${article.category}`);
        console.log(`   本文: ${article.hasBody ? 'あり' : 'なし'}`);
        console.log(`   説明文: ${article.hasDescription ? 'あり' : 'なし'}`);
        console.log(`   スラッグ: ${article.slug}\n`);
      });
      
      if (needsContentGeneration.length > 10) {
        console.log(`   ... 他 ${needsContentGeneration.length - 10}件\n`);
      }
    }
    
    // 処理計画の提案
    const batchSize = 5; // 一度に処理する記事数
    const totalBatches = Math.ceil(needsContentGeneration.length / batchSize);
    
    console.log('📋 処理計画:');
    console.log(`- バッチサイズ: ${batchSize}件ずつ`);
    console.log(`- 総バッチ数: ${totalBatches}バッチ`);
    console.log(`- 推定処理時間: ${totalBatches * 2}分程度\n`);
    
    // 最初のバッチを表示
    if (needsContentGeneration.length > 0) {
      console.log('🎯 最初のバッチ（5件）:');
      needsContentGeneration.slice(0, batchSize).forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} (${article.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

analyzeArticlesForContent();
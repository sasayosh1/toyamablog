import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function analyzeTitles() {
  try {
    console.log('📊 記事タイトルを分析中...\n');
    
    // 全記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 総記事数: ${posts.length}件\n`);
    
    // #shortsが含まれている記事
    const shortsEntries = posts.filter(post => 
      post.title && post.title.includes('#shorts')
    );
    
    console.log(`🎬 #shortsが含まれる記事: ${shortsEntries.length}件`);
    shortsEntries.forEach(post => {
      console.log(`   - "${post.title}" (${post.slug})`);
    });
    
    console.log('\n');
    
    // 文字化けの可能性がある記事を特定
    // 判定基準: 明らかに読めない文字、??、□、文字化け記号など
    const corruptedEntries = posts.filter(post => {
      if (!post.title) return false;
      
      // 文字化けパターン
      const corruptionPatterns = [
        /\?\?/, // ??が含まれる
        /□/, // 文字化け四角
        /\uFFFD/, // 置換文字
        /[^\p{L}\p{N}\p{P}\p{S}\p{Z}]/u, // 基本的な文字以外
        /^[a-zA-Z\s\-_]*$/, // 日本語なのに英数字のみ（不自然）
        /[^\u0000-\u007F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/u // 日本語・英語以外の文字
      ];
      
      return corruptionPatterns.some(pattern => pattern.test(post.title));
    });
    
    console.log(`🔧 文字化けの可能性がある記事: ${corruptedEntries.length}件`);
    corruptedEntries.forEach(post => {
      console.log(`   - "${post.title}" (${post.slug})`);
    });
    
    console.log('\n');
    
    // 特殊文字や記号が多い記事
    const specialCharEntries = posts.filter(post => {
      if (!post.title) return false;
      const specialCharCount = (post.title.match(/[^\p{L}\p{N}\s]/gu) || []).length;
      const totalLength = post.title.length;
      return specialCharCount / totalLength > 0.3; // 30%以上が特殊文字
    });
    
    console.log(`🔍 特殊文字が多い記事: ${specialCharEntries.length}件`);
    specialCharEntries.forEach(post => {
      console.log(`   - "${post.title}" (${post.slug})`);
    });
    
    console.log('\n');
    
    // 異常に短いまたは長いタイトル
    const unusualLengthEntries = posts.filter(post => {
      if (!post.title) return false;
      return post.title.length < 5 || post.title.length > 200;
    });
    
    console.log(`📏 異常な長さのタイトル: ${unusualLengthEntries.length}件`);
    unusualLengthEntries.forEach(post => {
      console.log(`   - "${post.title}" (${post.slug}) [長さ: ${post.title.length}]`);
    });
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

analyzeTitles();
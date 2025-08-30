const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function identifyCriticalArticles() {
  try {
    console.log('🚨 PHASE 1: 極端に短い記事の詳細分析...');
    console.log('===========================================');
    
    const posts = await client.fetch('*[_type == "post"] { _id, title, body, youtubeUrl, category, publishedAt }');
    
    let criticalArticles = [];
    
    posts.forEach(post => {
      let charCount = 0;
      if (post.body) {
        post.body.forEach(block => {
          if (block._type === 'block' && block.children) {
            const text = block.children.map(child => child.text).join('');
            charCount += text.length;
          }
        });
      }
      
      if (charCount < 100) {
        criticalArticles.push({
          id: post._id,
          title: post.title,
          chars: charCount,
          category: post.category,
          youtubeUrl: post.youtubeUrl,
          publishedAt: post.publishedAt
        });
      }
    });
    
    // 優先順位付け（動画があるもの優先、文字数少ない順）
    criticalArticles.sort((a, b) => {
      if (a.youtubeUrl && !b.youtubeUrl) return -1;
      if (!a.youtubeUrl && b.youtubeUrl) return 1;
      return a.chars - b.chars;
    });
    
    console.log(`📊 対象記事: ${criticalArticles.length}件`);
    console.log('');
    console.log('🎯 処理優先順位（上位10件）:');
    
    criticalArticles.slice(0, 10).forEach((article, i) => {
      const hasVideo = article.youtubeUrl ? '🎥' : '📝';
      console.log(`${i+1}. ${hasVideo} ${article.title.substring(0, 60)}...`);
      console.log(`    文字数: ${article.chars}, カテゴリ: ${article.category}`);
      console.log(`    ID: ${article.id}`);
      console.log('');
    });
    
    // 最初の記事を処理
    if (criticalArticles.length > 0) {
      console.log('🔄 最初の記事を詳細確認...');
      const firstArticle = criticalArticles[0];
      
      const fullArticle = await client.fetch(`*[_type == "post" && _id == "${firstArticle.id}"][0] { 
        _id, title, body, youtubeUrl, category, tags, excerpt 
      }`);
      
      console.log('📄 選択された記事:');
      console.log(`タイトル: ${fullArticle.title}`);
      console.log(`カテゴリ: ${fullArticle.category}`);
      console.log(`YouTube URL: ${fullArticle.youtubeUrl || 'なし'}`);
      console.log(`現在のタグ: ${fullArticle.tags ? fullArticle.tags.join(', ') : 'なし'}`);
      console.log(`現在の概要: ${fullArticle.excerpt || 'なし'}`);
      
      if (fullArticle.body) {
        console.log('\n現在の本文:');
        fullArticle.body.forEach((block, i) => {
          if (block._type === 'block' && block.children) {
            const text = block.children.map(child => child.text).join('');
            if (text.trim()) {
              console.log(`ブロック${i+1}: ${text}`);
            }
          }
        });
      }
      
      console.log('\n===========================================');
      console.log('この記事の内容拡充を開始する準備が整いました。');
    }
    
  } catch (error) {
    console.error('❌ 分析エラー:', error.message);
  }
}

identifyCriticalArticles();
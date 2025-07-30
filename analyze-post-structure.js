import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

async function analyzePostStructure() {
  try {
    console.log('🔍 既存記事の構造を分析中...');
    
    // サンプル記事を詳細に調査
    const samplePosts = await client.fetch(`*[_type == "post"] | order(_updatedAt desc) [0...3] {
      _id,
      _type,
      title,
      slug,
      content,
      body,
      text,
      description,
      tags,
      category,
      publishedAt,
      _createdAt,
      _updatedAt,
      ...
    }`);
    
    console.log(`📊 サンプル記事数: ${samplePosts.length}`);
    
    samplePosts.forEach((post, index) => {
      console.log(`\n--- 記事 ${index + 1} ---`);
      console.log(`タイトル: ${post.title}`);
      console.log(`ID: ${post._id}`);
      
      // フィールド一覧
      const fields = Object.keys(post).filter(key => !key.startsWith('_'));
      console.log(`フィールド: ${fields.join(', ')}`);
      
      // コンテンツの構造を確認
      if (post.content) {
        console.log(`content: ${typeof post.content} (長さ: ${Array.isArray(post.content) ? post.content.length : 'N/A'})`);
        if (Array.isArray(post.content) && post.content.length > 0) {
          console.log(`最初のブロック: ${post.content[0]._type || 'unknown'}`);
        }
      }
      
      if (post.body) {
        console.log(`body: ${typeof post.body} (長さ: ${Array.isArray(post.body) ? post.body.length : 'N/A'})`);
        if (Array.isArray(post.body) && post.body.length > 0) {
          console.log(`最初のブロック: ${post.body[0]._type || 'unknown'}`);
        }
      }
      
      // スラッグ情報
      if (post.slug) {
        console.log(`スラッグ: ${post.slug.current || post.slug}`);
      }
    });
    
    // 現在のスキーマ構造を確認
    console.log('\n🏗️ 現在のpostスキーマに含まれる可能性があるフィールド:');
    const allFields = new Set();
    
    const allPosts = await client.fetch(`*[_type == "post"] [0...10] {
      ...
    }`);
    
    allPosts.forEach(post => {
      Object.keys(post).forEach(key => {
        if (!key.startsWith('_')) {
          allFields.add(key);
        }
      });
    });
    
    console.log([...allFields].sort().join(', '));
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

analyzePostStructure();
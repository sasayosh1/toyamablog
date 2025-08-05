import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function debugTOC() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-cake-station"][0] {
      _id,
      title,
      body
    }`);
    
    if (!post || !Array.isArray(post.body)) {
      console.log('記事または本文が見つかりません');
      return;
    }
    
    console.log('=== TOC デバッグ情報 ===');
    console.log('記事ID:', post._id);
    console.log('タイトル:', post.title);
    console.log('本文ブロック数:', post.body.length);
    
    // 見出しをフィルタ
    const headings = post.body.filter(block => 
      block && (block.style === 'h2' || block.style === 'h3')
    );
    
    console.log('\n=== 見出し情報 ===');
    console.log('見出し数:', headings.length);
    
    headings.forEach((heading, index) => {
      const text = heading.children?.map(child => child.text).join('') || '';
      console.log(`${index + 1}. [${heading.style}] ${text}`);
    });
    
    // TOC表示条件をチェック
    console.log('\n=== TOC表示条件 ===');
    console.log('本文がArray:', Array.isArray(post.body));
    console.log('本文length > 0:', post.body.length > 0);
    console.log('見出し数 > 0:', headings.length > 0);
    console.log('TOC表示されるべき:', Array.isArray(post.body) && post.body.length > 0 && headings.length > 0 ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

debugTOC();
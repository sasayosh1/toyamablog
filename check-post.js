import { createClient } from '@sanity/client';
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkCakeStationPost() {
  try {
    const post = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-cake-station"][0] {
      _id,
      title,
      body
    }`);
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('記事タイトル:', post.title);
    console.log('本文:', post.body ? 'あり' : 'なし');
    console.log('本文タイプ:', Array.isArray(post.body) ? 'Array' : typeof post.body);
    console.log('本文ブロック数:', Array.isArray(post.body) ? post.body.length : 0);
    
    // H2, H3見出しをチェック
    if (Array.isArray(post.body)) {
      const headings = post.body.filter(block => 
        block.style === 'h2' || block.style === 'h3'
      );
      console.log('見出し数:', headings.length);
      headings.forEach((h, i) => {
        const text = h.children?.map(c => c.text).join('') || '';
        console.log(`  見出し${i+1}: ${h.style} - ${text}`);
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkCakeStationPost();
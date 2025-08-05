const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkCakeStationHeadings() {
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
    
    console.log('記事:', post.title);
    console.log('本文ブロック数:', post.body ? post.body.length : 0);
    
    // H2、H3見出しを探す
    const headings = [];
    if (post.body) {
      post.body.forEach((block, index) => {
        if (block.style === 'h2' || block.style === 'h3') {
          const text = block.children?.map(child => child.text).join('') || '';
          headings.push({
            index: index + 1,
            style: block.style,
            text: text.trim()
          });
        }
      });
    }
    
    console.log('見出し一覧:');
    if (headings.length === 0) {
      console.log('見出しが見つかりませんでした');
    } else {
      headings.forEach(heading => {
        console.log(`  ブロック${heading.index}: ${heading.style.toUpperCase()} - ${heading.text}`);
      });
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

checkCakeStationHeadings();
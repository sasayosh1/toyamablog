const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function getArticleDetails() {
  try {
    console.log('「tonami-city-festival」記事の詳細情報を取得中...\n');
    
    const query = `
      *[_type == "post" && slug.current == "tonami-city-festival"][0] {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        description,
        body,
        categories[]->{
          title
        },
        tags,
        youtubeUrl,
        _updatedAt
      }
    `;

    const article = await client.fetch(query);
    
    if (!article) {
      console.log('「tonami-city-festival」記事が見つかりませんでした。');
      return;
    }

    console.log('=== 記事詳細情報 ===');
    console.log(`タイトル: ${article.title}`);
    console.log(`スラッグ: ${article.slug?.current || 'なし'}`);
    console.log(`公開日: ${article.publishedAt || 'なし'}`);
    console.log(`更新日: ${article._updatedAt || 'なし'}`);
    console.log(`概要文: ${article.excerpt || 'なし'}`);
    console.log(`説明文: ${article.description || 'なし'}`);
    console.log(`カテゴリ: ${article.categories?.map(cat => cat.title).join(', ') || 'なし'}`);
    console.log(`タグ: ${Array.isArray(article.tags) ? article.tags.join(', ') : 'なし'}`);
    console.log(`YouTube URL: ${article.youtubeUrl || 'なし'}`);
    
    // 本文の詳細分析
    if (article.body) {
      console.log('\n=== 本文構造分析 ===');
      const textContent = extractTextFromContent(article.body);
      const wordCount = textContent.length;
      
      // 見出し分析
      const h2Matches = textContent.match(/## [^\n]+/g) || [];
      const h3Matches = textContent.match(/### [^\n]+/g) || [];
      
      console.log(`文字数: ${wordCount}文字`);
      console.log(`H2見出し数: ${h2Matches.length}個`);
      if (h2Matches.length > 0) {
        console.log('H2見出し一覧:');
        h2Matches.forEach((heading, index) => {
          console.log(`  ${index + 1}. ${heading}`);
        });
      }
      
      console.log(`H3見出し数: ${h3Matches.length}個`);
      if (h3Matches.length > 0) {
        console.log('H3見出し一覧:');
        h3Matches.forEach((heading, index) => {
          console.log(`  ${index + 1}. ${heading}`);
        });
      }
      
      // 箇条書き分析
      const bulletMatches = textContent.match(/^\s*[-*+•]/gm) || [];
      console.log(`箇条書き数: ${bulletMatches.length}個`);
      
      // 数値データ分析
      const numberMatches = textContent.match(/\d+/g) || [];
      console.log(`数値データ: ${numberMatches.length}個`);
      if (numberMatches.length > 0) {
        console.log(`数値例: ${numberMatches.slice(0, 10).join(', ')}`);
      }
      
      console.log('\n=== 本文全文 ===');
      console.log(textContent);
      
    } else {
      console.log('\n記事本文が見つかりませんでした。');
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

function extractTextFromContent(content) {
  if (!content) return '';
  
  return content.map(block => {
    if (block._type === 'block' && block.children) {
      const text = block.children.map(child => child.text || '').join('');
      
      // スタイル情報を基に見出しレベルを判定
      if (block.style === 'h2') {
        return `## ${text}`;
      } else if (block.style === 'h3') {
        return `### ${text}`;
      } else if (block.style === 'h4') {
        return `#### ${text}`;
      } else if (block.listItem) {
        return `- ${text}`;
      }
      
      return text;
    } else if (block._type === 'image') {
      return '[画像]';
    } else if (block._type === 'youtube') {
      return '[YouTube動画]';
    }
    return '';
  }).join('\n\n');
}

getArticleDetails();
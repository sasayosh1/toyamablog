const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function checkTonamiFestivalArticle() {
  try {
    console.log('砺波市祭り関連記事を検索中...\n');
    
    // 砺波市の祭りに関連する記事を検索
    const query = `
      *[_type == "post" && (
        slug.current match "*tonami*festival*" ||
        slug.current match "*tonami*city*festival*" ||
        title match "*砺波*祭*" ||
        title match "*砺波*フェス*" ||
        title match "*tonami*festival*"
      )] {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        content,
        categories[]->{
          title
        },
        tags,
        youtubeUrl,
        _updatedAt
      }
    `;

    const articles = await client.fetch(query);
    
    if (articles.length === 0) {
      console.log('砺波市の祭り関連記事が見つかりませんでした。');
      
      // より広範囲で砺波関連記事を検索
      console.log('\n砺波関連記事を広範囲検索中...\n');
      const broadQuery = `
        *[_type == "post" && (
          slug.current match "*tonami*" ||
          title match "*砺波*"
        )] | order(publishedAt desc) [0...10] {
          _id,
          title,
          slug,
          publishedAt,
          excerpt,
          categories[]->{
            title
          },
          tags
        }
      `;
      
      const broadArticles = await client.fetch(broadQuery);
      console.log(`砺波関連記事 ${broadArticles.length}件を発見:`);
      
      broadArticles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   スラッグ: ${article.slug?.current || 'なし'}`);
        console.log(`   カテゴリ: ${article.categories?.map(cat => cat.title).join(', ') || 'なし'}`);
        console.log(`   公開日: ${article.publishedAt || 'なし'}`);
        console.log('');
      });
      
      return;
    }

    console.log(`砺波市祭り関連記事 ${articles.length}件を発見:\n`);

    articles.forEach((article, index) => {
      console.log(`=== 記事 ${index + 1} ===`);
      console.log(`タイトル: ${article.title}`);
      console.log(`スラッグ: ${article.slug?.current || 'なし'}`);
      console.log(`公開日: ${article.publishedAt || 'なし'}`);
      console.log(`更新日: ${article._updatedAt || 'なし'}`);
      console.log(`概要: ${article.excerpt || 'なし'}`);
      console.log(`カテゴリ: ${article.categories?.map(cat => cat.title).join(', ') || 'なし'}`);
      console.log(`タグ: ${Array.isArray(article.tags) ? article.tags.join(', ') : 'なし'}`);
      console.log(`YouTube URL: ${article.youtubeUrl || 'なし'}`);
      
      // 本文の分析
      if (article.content) {
        const contentText = extractTextFromContent(article.content);
        const wordCount = contentText.length;
        const h2Count = (contentText.match(/##\s/g) || []).length;
        const h3Count = (contentText.match(/###\s/g) || []).length;
        const bulletCount = (contentText.match(/^\s*[-*+]/gm) || []).length;
        const numberMatches = contentText.match(/\d+/g) || [];
        
        console.log(`\n--- 記事分析 ---`);
        console.log(`文字数: ${wordCount}文字`);
        console.log(`H2見出し: ${h2Count}個`);
        console.log(`H3見出し: ${h3Count}個`);
        console.log(`箇条書き: ${bulletCount}個`);
        console.log(`数値データ: ${numberMatches.length}個`);
        
        // 本文の最初の500文字を表示
        console.log(`\n--- 本文プレビュー ---`);
        console.log(contentText.substring(0, 500) + '...\n');
      }
      
      console.log('=' * 50 + '\n');
    });

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

function extractTextFromContent(content) {
  if (!content) return '';
  
  return content.map(block => {
    if (block._type === 'block' && block.children) {
      return block.children.map(child => child.text || '').join(' ');
    }
    return '';
  }).join('\n');
}

checkTonamiFestivalArticle();
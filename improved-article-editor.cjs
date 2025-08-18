const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 記事管理機能
class ArticleManager {
  constructor() {
    this.client = client;
  }

  // 記事の詳細情報を取得
  async getArticleDetails(slug) {
    try {
      const query = `*[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        body,
        excerpt,
        category,
        tags,
        youtubeUrl,
        mainImage,
        publishedAt,
        "bodyLength": length(body),
        "wordCount": length(pt::text(body))
      }`;
      
      const article = await this.client.fetch(query, { slug });
      
      if (!article) {
        console.log('❌ 記事が見つかりませんでした');
        return null;
      }
      
      return article;
    } catch (error) {
      console.error('エラー:', error);
      return null;
    }
  }

  // 記事の全文を表示
  async displayFullArticle(slug) {
    try {
      const article = await this.getArticleDetails(slug);
      if (!article) return;

      console.log('\n🎯 記事詳細情報');
      console.log('==========================================');
      console.log(`📝 タイトル: ${article.title}`);
      console.log(`🔗 スラッグ: ${article.slug.current}`);
      console.log(`📂 カテゴリー: ${article.category || '未設定'}`);
      console.log(`🏷️ タグ: ${article.tags ? article.tags.join(', ') : '未設定'}`);
      console.log(`📺 YouTube: ${article.youtubeUrl || '未設定'}`);
      console.log(`📅 公開日: ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ja-JP') : '未公開'}`);
      console.log(`📊 ブロック数: ${article.bodyLength || 0}`);
      console.log(`📝 文字数: ${article.wordCount || 0}`);
      
      if (article.excerpt) {
        console.log(`\n📄 概要:\n${article.excerpt}`);
      }

      if (article.body && article.body.length > 0) {
        console.log('\n📖 本文:');
        console.log('==========================================');
        
        article.body.forEach((block, index) => {
          if (block._type === 'block' && block.children) {
            const text = block.children.map(child => child.text).join('');
            if (text.trim()) {
              const style = block.style || 'normal';
              const prefix = style === 'h2' ? '## ' : 
                           style === 'h3' ? '### ' : 
                           style === 'h4' ? '#### ' : '';
              console.log(`\n[ブロック ${index + 1}] ${style}:`);
              console.log(`${prefix}${text}`);
            }
          } else if (block._type === 'image') {
            console.log(`\n[ブロック ${index + 1}] image:`);
            console.log('🖼️ 画像が挿入されています');
          } else if (block._type === 'html') {
            console.log(`\n[ブロック ${index + 1}] html:`);
            console.log('🔧 HTMLコンテンツが挿入されています');
            if (block.html) {
              console.log(`内容: ${block.html.substring(0, 100)}...`);
            }
          }
        });
      }

      console.log('\n==========================================');
      
      return article;
    } catch (error) {
      console.error('エラー:', error);
      return null;
    }
  }

  // 記事の一部を更新
  async updateArticlePart(articleId, updates) {
    try {
      console.log('🔄 記事を更新中...');
      
      const result = await this.client
        .patch(articleId)
        .set(updates)
        .commit();
      
      console.log('✅ 記事の更新が完了しました');
      return result;
    } catch (error) {
      console.error('❌ 更新エラー:', error);
      return null;
    }
  }

  // 記事の本文に新しいブロックを追加
  async addBlockToArticle(articleId, newBlock, position = -1) {
    try {
      const article = await this.client.getDocument(articleId);
      if (!article) {
        console.log('❌ 記事が見つかりませんでした');
        return null;
      }

      const updatedBody = [...(article.body || [])];
      
      if (position === -1) {
        updatedBody.push(newBlock);
      } else {
        updatedBody.splice(position, 0, newBlock);
      }

      const result = await this.updateArticlePart(articleId, { body: updatedBody });
      console.log(`✅ ブロックを${position === -1 ? '末尾' : `位置${position}`}に追加しました`);
      
      return result;
    } catch (error) {
      console.error('❌ ブロック追加エラー:', error);
      return null;
    }
  }

  // 記事のブロックを削除
  async removeBlockFromArticle(articleId, blockIndex) {
    try {
      const article = await this.client.getDocument(articleId);
      if (!article) {
        console.log('❌ 記事が見つかりませんでした');
        return null;
      }

      const updatedBody = [...(article.body || [])];
      
      if (blockIndex >= 0 && blockIndex < updatedBody.length) {
        updatedBody.splice(blockIndex, 1);
        const result = await this.updateArticlePart(articleId, { body: updatedBody });
        console.log(`✅ ブロック${blockIndex + 1}を削除しました`);
        return result;
      } else {
        console.log('❌ 無効なブロックインデックスです');
        return null;
      }
    } catch (error) {
      console.error('❌ ブロック削除エラー:', error);
      return null;
    }
  }

  // 記事の特定ブロックを更新
  async updateArticleBlock(articleId, blockIndex, newContent) {
    try {
      const article = await this.client.getDocument(articleId);
      if (!article) {
        console.log('❌ 記事が見つかりませんでした');
        return null;
      }

      const updatedBody = [...(article.body || [])];
      
      if (blockIndex >= 0 && blockIndex < updatedBody.length) {
        if (typeof newContent === 'string') {
          // テキストブロックの場合
          updatedBody[blockIndex] = {
            _type: 'block',
            _key: updatedBody[blockIndex]._key || `block-${Date.now()}`,
            style: updatedBody[blockIndex].style || 'normal',
            children: [
              {
                _type: 'span',
                _key: `span-${Date.now()}`,
                text: newContent,
                marks: []
              }
            ],
            markDefs: []
          };
        } else {
          // オブジェクトの場合はそのまま置換
          updatedBody[blockIndex] = { ...updatedBody[blockIndex], ...newContent };
        }

        const result = await this.updateArticlePart(articleId, { body: updatedBody });
        console.log(`✅ ブロック${blockIndex + 1}を更新しました`);
        return result;
      } else {
        console.log('❌ 無効なブロックインデックスです');
        return null;
      }
    } catch (error) {
      console.error('❌ ブロック更新エラー:', error);
      return null;
    }
  }

  // 記事を検索
  async searchArticles(searchTerm, limit = 10) {
    try {
      const query = `*[_type == "post" && (
        title match $searchTerm + "*" ||
        slug.current match $searchTerm + "*" ||
        category match $searchTerm + "*"
      )][0...$limit] {
        _id,
        title,
        slug,
        category,
        publishedAt,
        "bodyLength": length(body)
      }`;
      
      const results = await this.client.fetch(query, { searchTerm, limit: limit - 1 });
      
      if (results.length === 0) {
        console.log('❌ 検索結果が見つかりませんでした');
        return [];
      }

      console.log(`\n🔍 検索結果 (${results.length}件):`);
      console.log('==========================================');
      
      results.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   スラッグ: ${article.slug.current}`);
        console.log(`   カテゴリー: ${article.category || '未設定'}`);
        console.log(`   ブロック数: ${article.bodyLength || 0}`);
        console.log(`   公開日: ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ja-JP') : '未公開'}`);
        console.log('');
      });

      return results;
    } catch (error) {
      console.error('検索エラー:', error);
      return [];
    }
  }

  // 記事の統計情報を取得
  async getArticleStats() {
    try {
      const stats = await this.client.fetch(`{
        "total": count(*[_type == "post"]),
        "published": count(*[_type == "post" && defined(publishedAt)]),
        "drafts": count(*[_type == "post" && !defined(publishedAt)]),
        "withYoutube": count(*[_type == "post" && defined(youtubeUrl)]),
        "withImages": count(*[_type == "post" && defined(mainImage)]),
        "withExcerpts": count(*[_type == "post" && defined(excerpt) && excerpt != ""]),
        "categories": array::unique(*[_type == "post" && defined(category)].category)
      }`);

      console.log('\n📊 記事統計情報');
      console.log('==========================================');
      console.log(`📝 総記事数: ${stats.total}`);
      console.log(`✅ 公開済み: ${stats.published}`);
      console.log(`📄 下書き: ${stats.drafts}`);
      console.log(`📺 YouTube付き: ${stats.withYoutube}`);
      console.log(`🖼️ 画像付き: ${stats.withImages}`);
      console.log(`📄 概要付き: ${stats.withExcerpts}`);
      console.log(`📂 カテゴリー数: ${stats.categories.length}`);
      console.log(`📂 カテゴリー: ${stats.categories.join(', ')}`);

      return stats;
    } catch (error) {
      console.error('統計情報取得エラー:', error);
      return null;
    }
  }
}

// 使用例とヘルプ機能
function showHelp() {
  console.log('\n🛠️ 記事編集ツール - 使用方法');
  console.log('==========================================');
  console.log('');
  console.log('📝 基本操作:');
  console.log('const manager = new ArticleManager();');
  console.log('');
  console.log('🔍 記事検索:');
  console.log('await manager.searchArticles("富山");');
  console.log('');
  console.log('📖 記事全文表示:');
  console.log('await manager.displayFullArticle("toyama-city-cake-station");');
  console.log('');
  console.log('📊 統計情報:');
  console.log('await manager.getArticleStats();');
  console.log('');
  console.log('✏️ 記事更新:');
  console.log('await manager.updateArticlePart(articleId, { title: "新しいタイトル" });');
  console.log('');
  console.log('➕ ブロック追加:');
  console.log('await manager.addBlockToArticle(articleId, newBlock);');
  console.log('');
  console.log('🗑️ ブロック削除:');
  console.log('await manager.removeBlockFromArticle(articleId, blockIndex);');
  console.log('');
  console.log('✏️ ブロック更新:');
  console.log('await manager.updateArticleBlock(articleId, blockIndex, "新しい内容");');
}

// コマンドライン引数の処理
async function main() {
  const manager = new ArticleManager();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];
  const param = args[1];

  switch (command) {
    case 'help':
      showHelp();
      break;
      
    case 'stats':
      await manager.getArticleStats();
      break;
      
    case 'search':
      if (!param) {
        console.log('❌ 検索キーワードを指定してください');
        console.log('例: node improved-article-editor.cjs search 富山');
        return;
      }
      await manager.searchArticles(param);
      break;
      
    case 'show':
      if (!param) {
        console.log('❌ 記事のスラッグを指定してください');
        console.log('例: node improved-article-editor.cjs show toyama-city-cake-station');
        return;
      }
      await manager.displayFullArticle(param);
      break;
      
    default:
      console.log('❌ 不明なコマンドです');
      showHelp();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ArticleManager, showHelp };
// SanityからSupabaseへの記事データ同期スクリプト
const { createClient: createSanityClient } = require('@sanity/client');
const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Sanityクライアント設定
const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

// Supabaseクライアント設定
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// カテゴリーマッピング
const categoryMapping = {
  '富山市': 1,
  '高岡市': 2,
  '射水市': 3,
  '氷見市': 4,
  '砺波市': 5,
  '黒部市': 6,
  '南砺市': 7,
  '滑川市': 8,
  '魚津市': 9,
  '小矢部市': 10,
  '立山町': 11,
  '入善町': 12,
  '朝日町': 13,
  '舟橋村': 14,
  '上市町': 15,
  '八尾町': 16
};

async function syncSanityToSupabase() {
  try {
    console.log('🔄 Sanity → Supabase データ同期開始...');

    // Sanityから記事データを取得
    const posts = await sanity.fetch(`
      *[_type == "post"] {
        _id,
        title,
        slug,
        category,
        publishedAt,
        tags,
        youtubeUrl,
        body,
        author->{name}
      }
    `);

    console.log(`📄 ${posts.length}件の記事を取得しました`);

    let syncCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        // マップの有無をチェック
        const hasMap = post.body ? post.body.some(block => 
          block._type === 'html' && 
          block.html && 
          block.html.includes('maps')
        ) : false;

        // カテゴリIDを取得
        const categoryId = categoryMapping[post.category] || null;

        // Supabaseにupsert
        const { error } = await supabase
          .from('articles')
          .upsert({
            sanity_id: post._id,
            title: post.title,
            slug: post.slug?.current || '',
            category_id: categoryId,
            author_id: '550e8400-e29b-41d4-a716-446655440000', // デフォルトユーザー
            published_at: post.publishedAt,
            tags: post.tags || [],
            youtube_url: post.youtubeUrl,
            has_map: hasMap,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'sanity_id'
          });

        if (error) {
          console.log(`❌ エラー: ${post.title} - ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ 同期: ${post.title}`);
          syncCount++;
        }

      } catch (itemError) {
        console.log(`⚠️ スキップ: ${post.title} - ${itemError.message}`);
        skipCount++;
      }
    }

    console.log('\n📊 同期結果:');
    console.log(`✅ 成功: ${syncCount}件`);
    console.log(`⏭️ スキップ: ${skipCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);

    // 統計情報の更新
    await updateArticleStats();

    console.log('\n🎉 Sanity → Supabase 同期完了！');

  } catch (error) {
    console.error('❌ 同期処理エラー:', error.message);
  }
}

async function updateArticleStats() {
  try {
    console.log('📊 記事統計を更新中...');

    // 各記事のビュー数とライク数を初期化
    const { error } = await supabase.rpc('update_article_stats');
    
    if (error) {
      console.log('⚠️ 統計更新エラー:', error.message);
    } else {
      console.log('✅ 記事統計更新完了');
    }
  } catch (error) {
    console.log('⚠️ 統計更新スキップ:', error.message);
  }
}

// 実行
if (require.main === module) {
  syncSanityToSupabase();
}

module.exports = { syncSanityToSupabase };
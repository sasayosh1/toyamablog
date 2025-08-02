import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function fixRemainingCategory() {
  try {
    console.log('🔧 残りのカテゴリーを修正中...\n');
    
    // 残りの県東部記事を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt) && category == "県東部"]{ 
        _id,
        title, 
        category,
        "slug": slug.current,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📋 修正対象記事数: ${posts.length}件\n`);
    
    for (const post of posts) {
      const regionMatch = post.title.match(/【([^】]+)】/);
      
      if (regionMatch) {
        const extractedRegion = regionMatch[1];
        
        console.log(`🔧 修正中: ${post.slug}`);
        console.log(`   タイトル: "${post.title}"`);
        console.log(`   変更前: "${post.category}"`);
        console.log(`   変更後: "${extractedRegion}"`);
        
        try {
          await client
            .patch(post._id)
            .set({ category: extractedRegion })
            .commit();
          
          console.log(`   ✅ 更新成功\n`);
          
        } catch (error) {
          console.error(`   ❌ 更新失敗: ${error.message}\n`);
        }
      }
    }
    
    console.log('🎉 修正完了！');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

fixRemainingCategory();
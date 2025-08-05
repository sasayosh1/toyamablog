import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function testTOC() {
  try {
    // 記事データを取得
    const post = await client.fetch(`*[_type == "post" && slug.current == "toyama-city-cake-station"][0] {
      _id,
      title,
      body
    }`);
    
    if (!post || !Array.isArray(post.body)) {
      console.log('❌ 記事データが正しくありません');
      return;
    }
    
    console.log('✅ 記事データ取得成功');
    console.log(`   タイトル: ${post.title}`);
    console.log(`   本文ブロック数: ${post.body.length}`);
    
    // 見出しを抽出（TOCコンポーネントと同じロジック）
    const headings = post.body
      .filter(b => b?.style === 'h2' || b?.style === 'h3')
      .map((b) => {
        const raw = (b?.children?.map(c => c.text).join('') || '').trim()
        const text = raw || '（無題の見出し）'
        return {
          text,
          level: (b.style === 'h3' ? 3 : 2)
        }
      });
    
    console.log(`✅ 見出し抽出成功: ${headings.length}個`);
    
    if (headings.length > 0) {
      console.log('   見出し一覧:');
      headings.forEach((h, i) => {
        console.log(`   ${i + 1}. [H${h.level}] ${h.text}`);
      });
      
      console.log('\n🎯 TOC表示条件チェック:');
      console.log(`   - isMounted: クライアントサイドで true になる`);
      console.log(`   - items.length > 0: ${headings.length > 0 ? '✅ true' : '❌ false'}`);
      console.log(`   - Array.isArray(content): ✅ true`);
      console.log(`   - content.length > 0: ✅ ${post.body.length} > 0`);
      
      console.log('\n💡 結論: TOCは正常に表示されるはずです');
    } else {
      console.log('❌ 見出しが見つかりません');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

testTOC();
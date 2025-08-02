import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

async function analyzeAllSlugs() {
  try {
    console.log('🔍 全記事のslug精査を開始します\n');
    
    // 全記事のslug情報を取得
    const posts = await client.fetch(`
      *[_type == "post" && defined(publishedAt)]{ 
        _id,
        title, 
        "slug": slug.current,
        youtubeUrl,
        publishedAt
      } | order(publishedAt desc)
    `);
    
    console.log(`📊 総記事数: ${posts.length}件\n`);
    
    // カテゴリ別集計
    const slugAnalysis = {
      total: posts.length,
      withYouTubeUrl: posts.filter(p => p.youtubeUrl).length,
      withoutYouTubeUrl: posts.filter(p => !p.youtubeUrl).length,
      duplicateSlugs: [],
      problematicSlugs: [],
      longSlugs: [],
      shortSlugs: []
    };
    
    // slug重複チェック
    const slugCounts = {};
    posts.forEach(post => {
      if (slugCounts[post.slug]) {
        slugCounts[post.slug].push(post);
      } else {
        slugCounts[post.slug] = [post];
      }
    });
    
    Object.keys(slugCounts).forEach(slug => {
      if (slugCounts[slug].length > 1) {
        slugAnalysis.duplicateSlugs.push({
          slug,
          count: slugCounts[slug].length,
          posts: slugCounts[slug]
        });
      }
    });
    
    // slug問題チェック
    posts.forEach(post => {
      const slug = post.slug;
      
      // 長すぎるslug (80文字以上)
      if (slug.length > 80) {
        slugAnalysis.longSlugs.push({
          slug,
          length: slug.length,
          title: post.title
        });
      }
      
      // 短すぎるslug (10文字未満)
      if (slug.length < 10) {
        slugAnalysis.shortSlugs.push({
          slug,
          length: slug.length,
          title: post.title
        });
      }
      
      // 問題のある文字を含むslug
      if (slug.includes('undefined') || slug.includes('null') || slug.includes('---') || slug.match(/[^\w\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
        slugAnalysis.problematicSlugs.push({
          slug,
          title: post.title,
          issues: []
        });
        
        if (slug.includes('undefined')) slugAnalysis.problematicSlugs[slugAnalysis.problematicSlugs.length - 1].issues.push('undefined含む');
        if (slug.includes('null')) slugAnalysis.problematicSlugs[slugAnalysis.problematicSlugs.length - 1].issues.push('null含む');
        if (slug.includes('---')) slugAnalysis.problematicSlugs[slugAnalysis.problematicSlugs.length - 1].issues.push('連続ハイフン');
        if (slug.match(/[^\w\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) slugAnalysis.problematicSlugs[slugAnalysis.problematicSlugs.length - 1].issues.push('特殊文字含む');
      }
    });
    
    // 結果表示
    console.log('📈 Slug分析結果:');
    console.log(`- 総記事数: ${slugAnalysis.total}件`);
    console.log(`- YouTube URL設定済み: ${slugAnalysis.withYouTubeUrl}件`);
    console.log(`- YouTube URL未設定: ${slugAnalysis.withoutYouTubeUrl}件`);
    console.log(`- 重複slug: ${slugAnalysis.duplicateSlugs.length}件`);
    console.log(`- 問題のあるslug: ${slugAnalysis.problematicSlugs.length}件`);
    console.log(`- 長すぎるslug (80文字以上): ${slugAnalysis.longSlugs.length}件`);
    console.log(`- 短すぎるslug (10文字未満): ${slugAnalysis.shortSlugs.length}件`);
    
    // 重複slugの詳細
    if (slugAnalysis.duplicateSlugs.length > 0) {
      console.log('\n🚨 重複slug一覧:');
      slugAnalysis.duplicateSlugs.forEach(item => {
        console.log(`- "${item.slug}" (${item.count}件重複)`);
        item.posts.forEach(post => {
          console.log(`  └ ${post.title.substring(0, 50)}...`);
        });
      });
    }
    
    // 問題のあるslugの詳細
    if (slugAnalysis.problematicSlugs.length > 0) {
      console.log('\n⚠️ 問題のあるslug一覧:');
      slugAnalysis.problematicSlugs.slice(0, 10).forEach(item => {
        console.log(`- "${item.slug}"`);
        console.log(`  問題: ${item.issues.join(', ')}`);
        console.log(`  記事: ${item.title.substring(0, 50)}...`);
      });
      if (slugAnalysis.problematicSlugs.length > 10) {
        console.log(`  ... 他${slugAnalysis.problematicSlugs.length - 10}件`);
      }
    }
    
    // 長すぎるslugの詳細
    if (slugAnalysis.longSlugs.length > 0) {
      console.log('\n📏 長すぎるslug一覧 (上位5件):');
      slugAnalysis.longSlugs
        .sort((a, b) => b.length - a.length)
        .slice(0, 5)
        .forEach(item => {
          console.log(`- ${item.length}文字: "${item.slug}"`);
          console.log(`  記事: ${item.title.substring(0, 50)}...`);
        });
    }
    
    // YouTube URL未設定の記事サンプル
    const postsWithoutYouTube = posts.filter(p => !p.youtubeUrl);
    if (postsWithoutYouTube.length > 0) {
      console.log('\n📹 YouTube URL未設定記事 (最新5件):');
      postsWithoutYouTube.slice(0, 5).forEach((post, i) => {
        console.log(`${i + 1}. "${post.slug}"`);
        console.log(`   タイトル: ${post.title.substring(0, 50)}...`);
        console.log(`   公開日: ${post.publishedAt}`);
      });
    }
    
    return slugAnalysis;
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    return null;
  }
}

analyzeAllSlugs();
import { createClient } from '@sanity/client';
import { config } from 'dotenv';
config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// YouTube サムネイル取得関数（lib/youtube.tsから複製）
function getYouTubeThumbnailWithFallback(url) {
  if (!url) return null;

  try {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    
    if (!videoIdMatch || !videoIdMatch[1]) {
      return null;
    }

    const videoId = videoIdMatch[1];
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  } catch (error) {
    console.error('YouTube thumbnail extraction error:', error);
    return null;
  }
}

// PostCardのgetThumbnailUrl関数を再現
function getThumbnailUrl(post) {
  // 1. YouTubeURLが存在する場合（最優先）
  if (post.youtubeUrl) {
    const youtubeThumb = getYouTubeThumbnailWithFallback(post.youtubeUrl);
    if (youtubeThumb) {
      return youtubeThumb;
    }
  }

  // 2. Sanityサムネイルが存在する場合（2番目の優先度）
  if (post.thumbnail?.asset?.url) {
    return post.thumbnail.asset.url;
  }

  // 3. カテゴリ別のカラーサムネイル（最後のフォールバック）
  const categoryColor = getCategoryColor(post.categories?.[0]);
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
      <rect width="400" height="225" fill="${categoryColor.bg}"/>
      <text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" 
            fill="${categoryColor.text}" font-size="18" font-family="Arial, sans-serif" font-weight="bold">
        ${post.categories?.[0] || '記事'}
      </text>
      <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" 
            fill="${categoryColor.text}" font-size="12" font-family="Arial, sans-serif">
        ${post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title}
      </text>
    </svg>
  `)}`;
}

// カテゴリ別の色彩定義
function getCategoryColor(category) {
  const colorMap = {
    'グルメ': { bg: '#FF5722', text: 'white' },
    '自然・公園': { bg: '#4CAF50', text: 'white' },
    '観光スポット': { bg: '#2196F3', text: 'white' },
    '文化・歴史': { bg: '#9C27B0', text: 'white' },
    'イベント': { bg: '#FF9800', text: 'white' },
    '温泉': { bg: '#E91E63', text: 'white' },
  };
  return colorMap[category || ''] || { bg: '#757575', text: 'white' };
}

async function testKurobeCardThumbnail() {
  console.log('🔍 kurobe-city-1記事のサムネイル表示テスト\n');
  
  try {
    // 記事データを取得
    const post = await client.fetch(`
      *[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        youtubeUrl,
        category,
        thumbnail {
          asset -> {
            _ref,
            url
          },
          alt
        },
        excerpt,
        description,
        "categories": [category],
        "displayExcerpt": coalesce(excerpt, description)
      }
    `, { slug: 'kurobe-city-1' });

    if (!post) {
      console.log('❌ 記事が見つかりませんでした');
      return;
    }

    console.log('📄 記事情報:');
    console.log(`   タイトル: ${post.title}`);
    console.log(`   YouTube URL: ${post.youtubeUrl || 'なし'}`);
    console.log(`   カテゴリ: ${post.category || 'なし'}`);
    console.log(`   Sanityサムネイル: ${post.thumbnail?.asset?.url || 'なし'}`);
    console.log('');

    // PostCardで使われるサムネイル優先順位をテスト
    console.log('🎯 サムネイル優先順位テスト:');
    
    // 1. YouTube サムネイル
    if (post.youtubeUrl) {
      const youtubeThumb = getYouTubeThumbnailWithFallback(post.youtubeUrl);
      console.log(`   1. YouTube サムネイル: ${youtubeThumb}`);
    } else {
      console.log(`   1. YouTube サムネイル: YouTube URLがありません`);
    }
    
    // 2. Sanity サムネイル
    if (post.thumbnail?.asset?.url) {
      console.log(`   2. Sanity サムネイル: ${post.thumbnail.asset.url}`);
    } else {
      console.log(`   2. Sanity サムネイル: 設定されていません`);
    }
    
    // 3. カテゴリ別フォールバックサムネイル
    const categoryColor = getCategoryColor(post.categories?.[0]);
    console.log(`   3. カテゴリ色: ${categoryColor.bg} (テキスト: ${categoryColor.text})`);
    
    console.log('');

    // 実際にPostCardで使われるサムネイルURL
    const actualThumbnailUrl = getThumbnailUrl(post);
    console.log('✅ 実際に表示されるサムネイル:');
    
    if (actualThumbnailUrl.startsWith('https://i.ytimg.com')) {
      console.log(`   種類: YouTube サムネイル`);
      console.log(`   URL: ${actualThumbnailUrl}`);
      console.log(`   📝 YouTube URLから自動生成されたサムネイルが使用されます`);
    } else if (actualThumbnailUrl.startsWith('https://cdn.sanity.io')) {
      console.log(`   種類: Sanity サムネイル`);
      console.log(`   URL: ${actualThumbnailUrl}`);
      console.log(`   📝 Sanityに設定されたカスタムサムネイルが使用されます`);
    } else if (actualThumbnailUrl.startsWith('data:image/svg+xml')) {
      console.log(`   種類: カテゴリ別フォールバック`);
      console.log(`   📝 カテゴリに基づいた色付きSVGが使用されます`);
      console.log(`   カテゴリ: ${post.categories?.[0] || '不明'}`);
      console.log(`   色: ${categoryColor.bg}`);
    }
    
    console.log('\n🔧 サムネイル表示の仕組み:');
    console.log('   1. YouTube URLがある場合 → YouTube自動サムネイル（最優先）');
    console.log('   2. Sanityにthumbnailがアップロードされている場合 → Sanityサムネイル');
    console.log('   3. どちらもない場合 → カテゴリ色のSVGサムネイル（フォールバック）');
    
    console.log('\n💡 現在の状況:');
    if (post.youtubeUrl && post.thumbnail?.asset?.url) {
      console.log('   ✅ YouTube URLがあるため、YouTube自動サムネイルが表示されます');
      console.log('   ℹ️  Sanityサムネイルは設定されていますが、優先度の関係で使用されません');
    } else if (post.youtubeUrl) {
      console.log('   ✅ YouTube URLがあるため、YouTube自動サムネイルが表示されます');
    } else if (post.thumbnail?.asset?.url) {
      console.log('   ✅ Sanityサムネイルが表示されます');
    } else {
      console.log('   ⚠️  フォールバックサムネイル（カテゴリ色SVG）が表示されます');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

testKurobeCardThumbnail();
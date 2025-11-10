const { createClient } = require('@sanity/client');
const https = require('https');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = 'UCxX3Eq8_KMl3AeYdhb5MklA';

// YouTube APIでチャンネルの全動画を取得
function fetchYouTubeVideos() {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&type=video&maxResults=50&order=date`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.items) {
            const videos = json.items.map(item => ({
              videoId: item.id.videoId,
              title: item.snippet.title,
              url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            }));
            resolve(videos);
          } else {
            reject(new Error('No videos found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// タイトルの類似度を計算（簡易版）
function calculateSimilarity(title1, title2) {
  const normalize = (str) => str.toLowerCase()
    .replace(/[【】\[\]]/g, '')
    .replace(/\s+/g, '')
    .replace(/[#＃]/g, '')
    .replace(/shorts?/gi, '');

  const t1 = normalize(title1);
  const t2 = normalize(title2);

  // 完全一致
  if (t1 === t2) return 1.0;

  // 部分一致をチェック
  const t1Words = t1.split('');
  const t2Words = t2.split('');
  let matchCount = 0;

  for (const char of t1Words) {
    if (t2Words.includes(char)) matchCount++;
  }

  return matchCount / Math.max(t1Words.length, t2Words.length);
}

async function findAndFixMissingVideos() {
  console.log('\n🔍 YouTube URLを検索して追加します\n');

  // 画像ソースがない記事を取得
  const posts = await client.fetch(`
    *[_type == "post" && !defined(youtubeUrl) && !defined(thumbnail)] {
      _id,
      title,
      "slug": slug.current
    }
  `);

  console.log(`📊 対象記事: ${posts.length}件\n`);

  if (posts.length === 0) {
    console.log('✅ 対象記事はありません');
    return;
  }

  // YouTube動画を取得
  console.log('📺 YouTube動画を取得中...');
  const videos = await fetchYouTubeVideos();
  console.log(`  取得完了: ${videos.length}件\n`);

  let fixedCount = 0;
  let notFoundCount = 0;

  for (const post of posts) {
    console.log(`\n処理中: ${post.title.substring(0, 60)}`);

    // タイトルから地域名を除去して検索
    const searchTitle = post.title.replace(/【.*?】/, '').trim();

    // 最も類似度の高い動画を探す
    let bestMatch = null;
    let bestScore = 0;

    for (const video of videos) {
      const score = calculateSimilarity(searchTitle, video.title);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = video;
      }
    }

    if (bestMatch && bestScore > 0.5) {
      console.log(`  ✓ マッチ発見 (類似度: ${(bestScore * 100).toFixed(1)}%)`);
      console.log(`    動画: ${bestMatch.title.substring(0, 60)}`);
      console.log(`    URL: ${bestMatch.url}`);

      try {
        await client
          .patch(post._id)
          .set({
            youtubeUrl: bestMatch.url,
            youtubeVideo: {
              _type: 'youtubeVideo',
              videoId: bestMatch.videoId,
              title: bestMatch.title,
              url: bestMatch.url
            }
          })
          .commit();

        console.log(`  ✅ 更新完了`);
        fixedCount++;
      } catch (error) {
        console.error(`  ❌ 更新エラー:`, error.message);
      }
    } else {
      console.log(`  ⚠️  該当動画が見つかりませんでした (最高類似度: ${(bestScore * 100).toFixed(1)}%)`);
      notFoundCount++;
    }
  }

  console.log(`\n📈 結果:`);
  console.log(`  - 更新成功: ${fixedCount}件`);
  console.log(`  - 動画未発見: ${notFoundCount}件`);
}

findAndFixMissingVideos()
  .then(() => {
    console.log('\n✅ スクリプト完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ エラー:', error);
    process.exit(1);
  });

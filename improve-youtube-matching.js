import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: 'skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ'
});

const YOUTUBE_API_KEY = 'AIzaSyAsSclg9Wq9AEMTXAp8KZW4G5vgRUTyIXY';
const CHANNEL_ID = 'UCxX3Eq8_KMl3AeYdhb5MklA';

async function getChannelVideos() {
  try {
    console.log('📺 YouTube APIから動画情報を取得中...');
    
    // より多くの動画を取得（200件）
    let allVideos = [];
    let nextPageToken = '';
    let pageCount = 0;
    const maxPages = 4; // 50 x 4 = 200件
    
    while (pageCount < maxPages) {
      const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&maxResults=50&order=date${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`YouTube API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        youtubeUrl: `https://youtube.com/shorts/${item.id.videoId}`
      }));
      
      allVideos = allVideos.concat(videos);
      
      console.log(`  ページ ${pageCount + 1}: ${videos.length}件取得`);
      
      if (!data.nextPageToken) break;
      nextPageToken = data.nextPageToken;
      pageCount++;
      
      // APIレート制限対策
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ 総計 ${allVideos.length}件の動画を取得しました\n`);
    return allVideos;
    
  } catch (error) {
    console.error('❌ YouTube API取得エラー:', error.message);
    return [];
  }
}

async function getPostsWithoutYouTubeUrl() {
  try {
    console.log('📝 YouTube URL未設定の記事を取得中...');
    
    const posts = await client.fetch(`
      *[_type == "post" && !defined(youtubeUrl)]{ 
        _id,
        title, 
        "slug": slug.current,
        publishedAt,
        description
      } | order(publishedAt desc)
    `);
    
    console.log(`✅ ${posts.length}件の未設定記事を取得しました\n`);
    return posts;
    
  } catch (error) {
    console.error('❌ Sanity取得エラー:', error.message);
    return [];
  }
}

// 改善されたタイトル正規化関数
function normalizeTitle(title) {
  return title
    // 日本語の括弧とハッシュタグを除去
    .replace(/[【】〔〕（）()]/g, '')
    .replace(/#shorts?/gi, '')
    .replace(/\s+/g, '')
    // 句読点と感嘆符を除去
    .replace(/[！？。、｜|]/g, '')
    // 英数字を小文字に統一
    .toLowerCase()
    // 特殊文字を除去
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
}

// 改善されたマッチング関数
function findMatchingVideo(postTitle, videos) {
  const normalizedPostTitle = normalizeTitle(postTitle);
  
  // 1. 完全一致を探す
  for (const video of videos) {
    const normalizedVideoTitle = normalizeTitle(video.title);
    if (normalizedPostTitle === normalizedVideoTitle) {
      return { video, matchType: '完全一致', confidence: 1.0 };
    }
  }
  
  // 2. 高精度部分一致（85%以上）
  for (const video of videos) {
    const normalizedVideoTitle = normalizeTitle(video.title);
    const similarity = calculateAdvancedSimilarity(normalizedPostTitle, normalizedVideoTitle);
    if (similarity >= 0.85) {
      return { video, matchType: `高精度一致 (${Math.round(similarity * 100)}%)`, confidence: similarity };
    }
  }
  
  // 3. キーワードベースマッチング
  const postKeywords = extractKeywords(postTitle);
  for (const video of videos) {
    const videoKeywords = extractKeywords(video.title);
    const keywordMatch = calculateKeywordMatch(postKeywords, videoKeywords);
    if (keywordMatch >= 0.8) {
      return { video, matchType: `キーワード一致 (${Math.round(keywordMatch * 100)}%)`, confidence: keywordMatch };
    }
  }
  
  // 4. 中精度部分一致（70%以上）
  for (const video of videos) {
    const normalizedVideoTitle = normalizeTitle(video.title);
    const similarity = calculateAdvancedSimilarity(normalizedPostTitle, normalizedVideoTitle);
    if (similarity >= 0.70) {
      return { video, matchType: `中精度一致 (${Math.round(similarity * 100)}%)`, confidence: similarity };
    }
  }
  
  return null;
}

// キーワード抽出関数
function extractKeywords(title) {
  // 地名、施設名、重要な単語を抽出
  const locationRegex = /【([^】]+)】/;
  const location = title.match(locationRegex)?.[1] || '';
  
  const keywords = [];
  if (location) keywords.push(location);
  
  // 重要な名詞を抽出（簡易版）
  const importantWords = title.match(/[一-龯]{2,}/g) || [];
  keywords.push(...importantWords.filter(word => word.length >= 2));
  
  return keywords;
}

// キーワードマッチ計算
function calculateKeywordMatch(keywords1, keywords2) {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  let matches = 0;
  for (const keyword1 of keywords1) {
    for (const keyword2 of keywords2) {
      if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(keywords1.length, keywords2.length);
}

// 改善された類似度計算
function calculateAdvancedSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  // より長い文字列に対する短い文字列の包含率も考慮
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  // 完全包含チェック
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  
  // レーベンシュタイン距離による類似度
  const editDistance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = (maxLength - editDistance) / maxLength;
  
  // 最長共通部分文字列による類似度
  const lcs = longestCommonSubstring(str1, str2);
  const lcsSimil = (lcs.length * 2) / (str1.length + str2.length);
  
  // 両方の類似度の加重平均
  return (similarity * 0.7) + (lcsSimil * 0.3);
}

function levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function longestCommonSubstring(str1, str2) {
  const matrix = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));
  let longest = '';
  
  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
        if (matrix[i][j] > longest.length) {
          longest = str1.substring(i - matrix[i][j], i);
        }
      }
    }
  }
  
  return longest;
}

async function main() {
  try {
    console.log('🔍 改善されたYouTube URLマッチングを開始します\n');
    
    // データ取得
    const videos = await getChannelVideos();
    if (videos.length === 0) {
      console.log('❌ YouTube動画の取得に失敗しました');
      return;
    }
    
    const posts = await getPostsWithoutYouTubeUrl();
    if (posts.length === 0) {
      console.log('❌ 未設定記事の取得に失敗しました');
      return;
    }
    
    console.log('🎯 マッチング分析開始...\n');
    
    const matches = [];
    const confidenceGroups = {
      high: [], // 0.9以上
      medium: [], // 0.7-0.89
      low: [] // 0.5-0.69
    };
    
    let processed = 0;
    
    for (const post of posts) {
      const match = findMatchingVideo(post.title, videos);
      
      if (match) {
        matches.push({
          post,
          video: match.video,
          matchType: match.matchType,
          confidence: match.confidence
        });
        
        if (match.confidence >= 0.9) {
          confidenceGroups.high.push(match);
        } else if (match.confidence >= 0.7) {
          confidenceGroups.medium.push(match);
        } else {
          confidenceGroups.low.push(match);
        }
        
        // 高信頼度のマッチのみ詳細表示
        if (match.confidence >= 0.85) {
          console.log(`✅ ${match.matchType}`);
          console.log(`   記事: ${post.title.substring(0, 50)}...`);
          console.log(`   動画: ${match.video.title.substring(0, 50)}...`);
          console.log(`   信頼度: ${Math.round(match.confidence * 100)}%`);
          console.log('');
        }
      }
      
      processed++;
      if (processed % 50 === 0) {
        console.log(`📊 進捗: ${processed}/${posts.length} 件処理済み`);
      }
    }
    
    console.log('\n📈 マッチング結果サマリー:');
    console.log(`- YouTube動画数: ${videos.length}件`);
    console.log(`- 未設定記事数: ${posts.length}件`);
    console.log(`- 総マッチ数: ${matches.length}件 (${Math.round(matches.length / posts.length * 100)}%)`);
    console.log(`- 高信頼度 (90%+): ${confidenceGroups.high.length}件`);
    console.log(`- 中信頼度 (70-89%): ${confidenceGroups.medium.length}件`);
    console.log(`- 低信頼度 (50-69%): ${confidenceGroups.low.length}件`);
    
    console.log('\n⚠️ 分析完了。次のステップで実際の更新を行います。');
    
    return matches;
    
  } catch (error) {
    console.error('❌ 全体エラー:', error.message);
    return [];
  }
}

main();
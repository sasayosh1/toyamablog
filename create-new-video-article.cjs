const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function createNewVideoArticle(videoUrl, articleData) {
  try {
    console.log('📝 新しいYouTube記事を作成中...');
    console.log(`🎥 動画URL: ${videoUrl}`);
    
    // YouTube URLから動画IDを抽出
    const videoMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
    if (!videoMatch) {
      throw new Error('無効なYouTube URLです');
    }
    
    const videoId = videoMatch[1];
    console.log(`🆔 動画ID: ${videoId}`);
    
    // 既存の動画IDと重複チェック
    const existingPost = await client.fetch(
      `*[_type == "post" && youtubeUrl match "*${videoId}*"][0]`
    );
    
    if (existingPost) {
      console.log('⚠️ この動画は既に記事化されています:', existingPost.title);
      return { success: false, reason: 'duplicate' };
    }
    
    // スラッグを生成
    const baseSlug = articleData.location.toLowerCase()
      .replace(/[【】]/g, '')
      .replace(/市|町|村|県/g, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // 重複しないスラッグを生成
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existingSlugPost = await client.fetch(
        `*[_type == "post" && slug.current == "${uniqueSlug}"][0]`
      );
      if (!existingSlugPost) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // 記事構造を作成（2000-2500文字の最適化版）
    const body = [
      // 導入文
      {
        _type: 'block',
        _key: `intro-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-intro-${Date.now()}`,
          text: articleData.intro,
          marks: []
        }],
        markDefs: []
      },
      // H2セクション1
      {
        _type: 'block',
        _key: `h2-1-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-1-${Date.now()}`,
          text: articleData.section1.h2,
          marks: []
        }],
        markDefs: []
      },
      // H3セクション1
      {
        _type: 'block',
        _key: `h3-1-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-1-${Date.now()}`,
          text: articleData.section1.h3,
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `content-1-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-content-1-${Date.now()}`,
          text: articleData.section1.content,
          marks: []
        }],
        markDefs: []
      },
      // H2セクション2
      {
        _type: 'block',
        _key: `h2-2-${Date.now()}`,
        style: 'h2',
        children: [{
          _type: 'span',
          _key: `span-h2-2-${Date.now()}`,
          text: articleData.section2.h2,
          marks: []
        }],
        markDefs: []
      },
      // H3セクション2
      {
        _type: 'block',
        _key: `h3-2-${Date.now()}`,
        style: 'h3',
        children: [{
          _type: 'span',
          _key: `span-h3-2-${Date.now()}`,
          text: articleData.section2.h3,
          marks: []
        }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: `content-2-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-content-2-${Date.now()}`,
          text: articleData.section2.content,
          marks: []
        }],
        markDefs: []
      },
      // まとめ
      {
        _type: 'block',
        _key: `conclusion-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-conclusion-${Date.now()}`,
          text: articleData.conclusion,
          marks: []
        }],
        markDefs: []
      }
    ];
    
    // 記事をSanityに作成
    const newPost = {
      _type: 'post',
      title: articleData.title,
      slug: {
        _type: 'slug',
        current: uniqueSlug
      },
      excerpt: articleData.excerpt,
      body: body,
      youtubeUrl: videoUrl,
      category: articleData.category,
      tags: articleData.tags,
      publishedAt: new Date().toISOString(),
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString()
    };
    
    const result = await client.create(newPost);
    
    console.log('✅ 記事作成成功！');
    console.log(`📄 タイトル: ${result.title}`);
    console.log(`🔗 スラッグ: ${result.slug.current}`);
    console.log(`📊 文字数: ${JSON.stringify(body).length}文字（概算）`);
    
    return { success: true, post: result };
    
  } catch (error) {
    console.error('❌ 記事作成エラー:', error);
    return { success: false, error: error.message };
  }
}

// 使用例:
// const articleData = {
//   title: "【富山市】新しいスポットタイトル",
//   location: "富山市",
//   intro: "導入文...",
//   section1: {
//     h2: "第1セクション見出し",
//     h3: "第1サブ見出し",
//     content: "第1セクション内容..."
//   },
//   section2: {
//     h2: "第2セクション見出し", 
//     h3: "第2サブ見出し",
//     content: "第2セクション内容..."
//   },
//   conclusion: "まとめ文...",
//   excerpt: "記事概要...",
//   category: "富山市",
//   tags: ["タグ1", "タグ2", "タグ3"]
// };
// 
// const videoUrl = "https://youtube.com/shorts/XXXXXXXXXXX";
// createNewVideoArticle(videoUrl, articleData);

module.exports = { createNewVideoArticle };
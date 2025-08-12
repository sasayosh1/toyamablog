const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function handleMissingVideos() {
  try {
    console.log('動画なし記事の処理方針を決定中...');
    
    // YouTube URLが未設定の記事一覧
    const articlesWithoutVideos = [
      '4zxT7RlbAnSlGPWZgbmWMH', // 氷見あいやまガーデン
      'o031colbTiBAm1wuPGbqSb', // クロスランドおやべイルミ2020
      '4zxT7RlbAnSlGPWZgbmUif', // 九殿浜温泉
      '4zxT7RlbAnSlGPWZgbmUTQ', // 光久寺
      'vTFXi0ufHZhGd7mVymG5jK', // クリスマスイルミネーション2020
      'vTFXi0ufHZhGd7mVymG3AN', // ごんごん祭り
      'o031colbTiBAm1wuPGbjNt', // ひみラボ水族館
      'vTFXi0ufHZhGd7mVymG2Tz', // 環水公園サマーファウンテン1
      'vTFXi0ufHZhGd7mVymG2QS', // 環水公園サマーファウンテン2
      'o031colbTiBAm1wuPGbi5F',  // 4秒後の噴水ショー
      'vTFXi0ufHZhGd7mVymG2Mv', // 環水公園サマーファウンテン明るい版
      'o031colbTiBAm1wuPGbhPJ',  // 城端別院 善徳寺
      '4zxT7RlbAnSlGPWZgbmCbq', // じょうはな織館
      '4zxT7RlbAnSlGPWZgbmBXn', // 相倉合掌造り
      'o031colbTiBAm1wuPGbfk5',  // 魚眠洞
      'vTFXi0ufHZhGd7mVymG1Gd'  // 民宿美岬
    ];
    
    console.log(`処理対象: ${articlesWithoutVideos.length}件`);
    console.log('');
    console.log('📋 推奨される対応方針:');
    console.log('');
    console.log('【オプション1】動画なし記事として残す');
    console.log('- メリット: コンテンツとしては価値がある');
    console.log('- デメリット: サムネイルが表示されない');
    console.log('');
    console.log('【オプション2】実際に動画を作成・撮影');
    console.log('- メリット: 完全なYouTube Shorts記事になる');
    console.log('- デメリット: 時間とリソースが必要');
    console.log('');
    console.log('【オプション3】代替画像をサムネイルに設定');
    console.log('- メリット: 視覚的に改善される');
    console.log('- デメリット: YouTube連携のメリットを失う');
    console.log('');
    console.log('【オプション4】記事を非公開にする');
    console.log('- メリット: サイトの品質統一');
    console.log('- デメリット: コンテンツ数の減少');
    
    // 高優先度記事の特定
    const highPriorityArticles = await client.fetch(`*[_type == "post" && _id in [
      "4zxT7RlbAnSlGPWZgbmWMH",
      "4zxT7RlbAnSlGPWZgbmUif", 
      "vTFXi0ufHZhGd7mVymG5jK",
      "o031colbTiBAm1wuPGbjNt"
    ]] {
      _id,
      title,
      category,
      _createdAt
    } | order(_createdAt desc)`);
    
    console.log('');
    console.log('🎯 高優先度記事（動画作成推奨）:');
    highPriorityArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   カテゴリー: ${article.category}`);
    });
    
    console.log('');
    console.log('💡 推奨アクション:');
    console.log('1. 高優先度記事（4件）は動画作成を検討');
    console.log('2. その他の記事は動画なし記事として維持');
    console.log('3. サイト全体の品質向上のため、代替サムネイルシステムを検討');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

handleMissingVideos();
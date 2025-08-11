import { createClient } from '@sanity/client';
import fs from 'fs';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN
});

// Phase 1: 最重要問題の一括修正
async function phase1BulkFix() {
  try {
    console.log('🚀 Phase 1: 最重要問題の一括修正を開始...');
    
    // 分析レポートを読み込み
    const reportData = JSON.parse(
      await fs.promises.readFile('/Users/user/toyamablog/quality-analysis-report.json', 'utf8')
    );
    
    const problemArticles = reportData.problemArticles;
    console.log(`📊 対象記事数: ${problemArticles.length}記事`);
    
    let fixedCount = 0;
    let errors = [];
    
    // 地域名とカテゴリのマッピング
    const regionCategories = {
      '富山市': '富山市',
      '高岡市': '高岡市',
      '砺波市': '砺波市',
      '氷見市': '氷見市',
      '黒部市': '黒部市',
      '射水市': '射水市',
      '南砺市': '南砺市',
      '滑川市': '滑川市',
      '魚津市': '魚津市',
      '小矢部市': '小矢部市',
      '上市町': '上市町',
      '立山町': '立山町',
      '入善町': '入善町',
      '朝日町': '朝日町',
      '八尾町': '富山市',
      '婦中町': '富山市',
      '福岡町': '高岡市',
      '舟橋村': '舟橋村'
    };
    
    // デフォルト画像の設定
    const defaultImages = {
      '富山市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '高岡市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '砺波市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '氷見市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '黒部市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '射水市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '南砺市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '滑川市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '魚津市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '小矢部市': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '上市町': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '立山町': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '入善町': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '朝日町': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg',
      '舟橋村': 'image-3NfTO4Vxu5tJlP5kRCTRoV17-2000x1500-jpg'
    };
    
    for (const article of problemArticles) {
      try {
        console.log(`🔧 修正中: ${article.title}`);
        
        const updates = {};
        
        // 1. カテゴリ設定
        if (article.contentIssues.includes('カテゴリ未設定')) {
          const title = article.title || '';
          let category = null;
          
          // タイトルから地域名を抽出
          for (const [region, cat] of Object.entries(regionCategories)) {
            if (title.includes(`【${region}】`)) {
              category = cat;
              break;
            }
          }
          
          if (category) {
            updates.category = category;
          }
        }
        
        // 2. mainImage設定
        if (article.imageIssues.includes('mainImage未設定')) {
          const title = article.title || '';
          let imageAsset = null;
          
          // デフォルト画像を設定
          for (const [region, assetId] of Object.entries(defaultImages)) {
            if (title.includes(`【${region}】`)) {
              imageAsset = {
                _type: 'image',
                asset: {
                  _ref: assetId,
                  _type: 'reference'
                }
              };
              break;
            }
          }
          
          if (imageAsset) {
            updates.mainImage = imageAsset;
          }
        }
        
        // 3. excerpt設定（概要文）
        if (article.contentIssues.includes('概要文（excerpt）未設定')) {
          const title = article.title || '';
          // タイトルから簡潔な説明文を生成
          const match = title.match(/【(.+?)】(.+)/);
          if (match) {
            const region = match[1];
            const content = match[2];
            updates.excerpt = `${region}で話題の${content.substring(0, 30)}...富山の魅力をお届けします。`;
          }
        }
        
        // 更新実行
        if (Object.keys(updates).length > 0) {
          await client.patch(article.id).set(updates).commit();
          fixedCount++;
          console.log(`✅ 修正完了: ${article.title}`);
          console.log(`   更新項目: ${Object.keys(updates).join(', ')}`);
        } else {
          console.log(`⚠️  更新項目なし: ${article.title}`);
        }
        
        // API制限対策：少し待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ 修正エラー: ${article.title}`, error.message);
        errors.push({ title: article.title, error: error.message });
      }
    }
    
    console.log('\n🎉 Phase 1 一括修正完了！');
    console.log(`✅ 修正成功: ${fixedCount}記事`);
    console.log(`❌ 修正エラー: ${errors.length}記事`);
    
    if (errors.length > 0) {
      console.log('\nエラー詳細:');
      errors.forEach(err => {
        console.log(`- ${err.title}: ${err.error}`);
      });
    }
    
    // 修正結果をファイルに保存
    const result = {
      phase: 'Phase 1 - 一括修正',
      completedAt: new Date().toISOString(),
      fixedCount,
      errorCount: errors.length,
      errors,
      summary: {
        カテゴリ設定: fixedCount,
        mainImage設定: fixedCount,
        excerpt設定: fixedCount
      }
    };
    
    await fs.promises.writeFile(
      '/Users/user/toyamablog/phase1-fix-result.json',
      JSON.stringify(result, null, 2),
      'utf8'
    );
    
    console.log('📄 修正結果が phase1-fix-result.json に保存されました。');
    
  } catch (error) {
    console.error('❌ Phase 1 実行エラー:', error);
    throw error;
  }
}

// スクリプト実行
phase1BulkFix().catch(console.error);
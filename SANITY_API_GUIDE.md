# Sanity API Token 設定・使用ガイド

## 🔐 API Token 設定状況

### 現在の設定
- **プロジェクトID**: `aoxze287`
- **データセット**: `production`
- **APIバージョン**: `2024-01-01`
- **API Token**: `.env.local` に正常設定済み

### 環境変数の場所
```
ファイル: /Users/user/toyamablog/.env.local
設定値: SANITY_API_TOKEN=skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ
```

## ✅ API Token 動作確認方法

### 基本的な確認
```javascript
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

// 読み取りテスト
const testRead = async () => {
  try {
    const result = await client.fetch('*[_type == "post"][0]');
    console.log('✅ 読み取り成功');
    return true;
  } catch (error) {
    console.error('❌ 読み取りエラー:', error.message);
    return false;
  }
};

// 書き込みテスト
const testWrite = async () => {
  try {
    const doc = await client.create({
      _type: 'post',
      title: 'Test Document',
      slug: { current: 'test-' + Date.now() }
    });
    await client.delete(doc._id); // 即座に削除
    console.log('✅ 書き込み成功');
    return true;
  } catch (error) {
    console.error('❌ 書き込みエラー:', error.message);
    return false;
  }
};
```

## 🔧 正しい実装パターン

### 環境変数の適切な読み込み
```bash
# コマンド実行時は明示的にexport
export SANITY_API_TOKEN="skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ"

# Node.js実行
node -e "console.log('Token:', process.env.SANITY_API_TOKEN ? 'Present' : 'Missing')"
```

### 記事更新の標準パターン
```javascript
export SANITY_API_TOKEN="[TOKEN]" && node -e "
const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updateArticle(slug, updates) {
  const article = await client.fetch('*[slug.current == $slug][0]', { slug });
  if (!article) throw new Error('Article not found');
  
  return await client.patch(article._id).set(updates).commit();
}
"
```

## 🚨 重大インシデント記録

### 2025年9月3日: Sanity API Token 権限誤判定インシデント
- **問題**: 正常に設定済みのAPIトークンを「権限不足」と誤判定
- **原因**: 環境変数の適切な読み込み処理の不備
- **影響**: ユーザーに「手動編集が必要」という虚偽情報を提供
- **重大性**: 自動化可能な作業を手動作業として誤案内
- **教訓**: **環境変数確認と適切な設定を最優先で実行する**
- **対策**: APIトークンエラー時は必ず環境変数の明示的export後に再試行

## ⚡ 緊急対応プロトコル

### APIトークンエラーが発生した場合の対処順序
1. **環境変数の存在確認**
   ```bash
   echo "Token exists: ${SANITY_API_TOKEN:+Yes}"
   ```

2. **明示的なexportによる再設定**
   ```bash
   export SANITY_API_TOKEN="skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ"
   ```

3. **再試行による動作確認**
   - 最低1回は環境変数を明示的にexportしてから再実行
   - エラーが継続する場合のみ代替手段を検討

4. **結果報告の正確性確保**
   - 推測や仮定に基づく回答の完全禁止
   - 実際の動作確認結果のみを報告

## 🎯 今後の防止策

### 必須チェックリスト
- [ ] 環境変数の存在確認
- [ ] 明示的なexportによる設定
- [ ] 実際のAPI呼び出しテスト
- [ ] エラー詳細の正確な分析
- [ ] 代替手段提案前の再試行

### 絶対禁止事項
- ❌ 推測に基づく権限不足の断定
- ❌ 検証不十分な「不可能」判定
- ❌ 環境確認なしでの手動作業推奨
- ❌ APIトークン設定済み状況での虚偽報告

## 🔄 定期確認コマンド

```bash
# APIトークン動作確認（月次実行推奨）
export SANITY_API_TOKEN="skkTjwpdrsjKKpaDxKVShzCSI7GMWE1r5TQdwl0b7LTylVPoAxzBg0oPqhtUQyfPjyvtZW2mu6nfUMNUJ" && node -e "
const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

client.fetch('*[_type == \"post\"] | order(_createdAt desc)[0]')
  .then(result => console.log('✅ Sanity API 正常動作確認'))
  .catch(error => console.error('❌ API エラー:', error.message));
"
```

---

**重要**: このドキュメントは2025年9月3日の重大インシデントを受けて作成されました。今後は必ずこのガイドに従い、APIトークンの動作確認を適切に実行してください。
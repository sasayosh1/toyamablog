# Sanity API権限更新ガイド

## 現在の問題
`Insufficient permissions; permission "update" required` エラーが発生しており、記事のメタデータ更新ができません。

## 解決手順

### 1. Sanity管理画面へアクセス
```
https://www.sanity.io/manage
```

### 2. プロジェクト選択
- プロジェクトID: `aoxze287` 
- プロジェクト名: TOYAMA BLOG を選択

### 3. API設定画面へ移動
1. 左メニューから **「API」** をクリック
2. **「Tokens」** タブを選択

### 4. 現在のトークン確認
- 現在使用中のトークンを確認
- 権限レベルが `Read` または `Read+Write` になっているか確認

### 5. 新しいトークン作成（推奨）
1. **「Add API token」** ボタンをクリック
2. 設定項目：
   - **Name**: `TOYAMA-BLOG-FULL-ACCESS`
   - **Permissions**: **`Editor`** または **`Admin`** を選択
   - **Dataset**: `production`
3. **「Save」** をクリック
4. 表示されたトークンをコピー（一度しか表示されません）

### 6. 環境変数更新
新しいトークンを環境変数に設定：

```bash
# .env ファイルを更新
echo "SANITY_API_TOKEN=YOUR_NEW_TOKEN_HERE" > .env
```

または、直接実行時に指定：

```bash
SANITY_API_TOKEN=YOUR_NEW_TOKEN_HERE node complete-remaining-metadata.js
```

### 7. 権限レベルの説明
- **Viewer**: 読み取り専用
- **Editor**: 読み取り + 書き込み + 更新 ✅
- **Admin**: 全権限 ✅

## 確認方法
新しいトークンが正しく設定されているか確認：

```bash
node -e "
const { createClient } = require('@sanity/client');
const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});
client.fetch('*[_type == \"post\"][0]').then(r => console.log('✅ 接続成功')).catch(e => console.log('❌ エラー:', e.message));
"
```

## 更新後の作業
権限更新後、以下を実行して残り53件のメタデータを完了：

```bash
node complete-remaining-metadata.js
```

## 注意事項
- 古いトークンは削除しても構いません
- Admin権限は強力なので、使用後は適切に管理してください
- トークンは絶対に公開しないでください
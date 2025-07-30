# 🔑 Sanity APIトークン取得ガイド

## 📍 今開いている画面
https://www.sanity.io/manage/project/aoxze287

## 🎯 APIトークン取得手順

### ステップ 1: APIセクションにアクセス
1. 左サイドバーで **「API」** をクリック
2. **「Tokens」** タブをクリック

### ステップ 2: 新しいトークンを作成
1. **「Add API token」** ボタンをクリック
2. 以下を入力：
   - **Name**: `Blog Editor`
   - **Permissions**: **「Editor」** を選択
3. **「Add token」** をクリック

### ステップ 3: トークンをコピー
1. 生成されたトークンをコピー（一度しか表示されません）
2. トークンは以下の形式: `skXXXXXX...`

### ステップ 4: 環境変数に設定
トークンを取得したら、以下のコマンドを実行：

```bash
echo 'SANITY_API_TOKEN=your-copied-token-here' >> .env.local
```

## ⚡ 取得後の自動編集

APIトークン設定後、以下のスクリプトで自動編集を実行：

```bash
node add-youtube-to-existing-post.js
```

---

**🔑 APIトークンを取得して、既存記事の自動編集を開始しましょう！**
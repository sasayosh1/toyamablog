# 🎬 既存324記事にYouTube Shorts追加ガイド

## 📊 現状確認
- **既存記事数**: 324件の`post`タイプ
- **本番サイト**: https://sasakiyoshimasa.com
- **Sanity Studio**: http://localhost:4321/studio
- **プロジェクトID**: aoxze287 (TOYAMA BLOG)

## ✅ 完了済み作業
- 既存記事構造の分析完了
- YouTube Shortsスキーマを既存`post`タイプに追加
- `body`フィールドにYouTube Shorts機能を統合

## 🎯 既存記事にYouTube Shorts追加方法

### 手順 1: Sanity Studioにアクセス
1. ブラウザで http://localhost:4321/studio を開く
2. ログインして管理画面にアクセス

### 手順 2: 編集したい記事を選択
1. 左サイドバーの「記事」をクリック
2. 324件の記事リストから編集したい記事を選択
3. 記事をクリックして編集画面を開く

### 手順 3: YouTube Shortsを追加
1. **「記事内容」（body）セクション**を見つける
2. 既存コンテンツの下部で **「+ Add item」** をクリック
3. **「YouTube Shorts」** を選択

### 手順 4: YouTube Shorts情報を入力
**必須項目**:
- **YouTube Shorts URL**: 
  - `https://www.youtube.com/shorts/VIDEO_ID`
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`

**オプション項目**:
- **動画タイトル**: 動画の説明やキャプション
- **自動再生**: デフォルトはオフ（推奨）
- **コントロールを表示**: デフォルトはオン（推奨）

### 手順 5: 保存して公開
1. **「Save」** で変更を保存
2. 記事がすでに公開済みの場合は自動的に更新されます

## 🎬 推奨するYouTube Shorts追加パターン

### パターン 1: 記事の最後に関連動画を追加
```
[既存の記事コンテンツ]

--- YouTube Shorts追加 ---
動画タイトル: 「この記事で紹介したスポットの動画」
URL: [関連するYouTube Shorts URL]
```

### パターン 2: 記事の途中に補足動画を追加
```
[記事の前半]

--- YouTube Shorts追加 ---
動画タイトル: 「実際の様子をショート動画で」
URL: [補足説明のYouTube Shorts URL]

[記事の後半]
```

### パターン 3: 記事の冒頭にイントロ動画を追加
```
--- YouTube Shorts追加 ---
動画タイトル: 「今回紹介するスポットの魅力」
URL: [イントロ動画のYouTube Shorts URL]

[既存の記事コンテンツ]
```

## 📝 効率的な編集のコツ

### 優先度の高い記事から編集
1. **人気記事**: アクセス数の多い記事
2. **最新記事**: 最近投稿した記事
3. **シーズン記事**: 季節性のある記事

### YouTube Shorts動画の選び方
- **記事内容と関連性の高い動画**
- **富山の観光スポットの動画**
- **記事で紹介した場所の実際の映像**
- **#shorts タグ付きの短時間動画**

### 一括編集のための準備
1. 編集したい記事のリストアップ
2. 各記事に追加するYouTube URLの準備
3. 動画タイトルの事前準備

## 🔧 トラブルシューティング

### YouTube URLが認識されない場合
✅ **正しい形式**:
- `https://www.youtube.com/shorts/jNQXAC9IVRw`
- `https://www.youtube.com/watch?v=jNQXAC9IVRw`
- `https://youtu.be/jNQXAC9IVRw`

❌ **間違った形式**:
- `youtube.com/shorts/jNQXAC9IVRw` (httpsなし)
- `www.youtube.com/watch?v=jNQXAC9IVRw` (httpsなし)

### 保存できない場合
1. 必須項目（YouTube URL）が入力されているか確認
2. ブラウザを再読み込み
3. Sanity Studioからログアウト→ログイン

### 動画が表示されない場合
1. URLが正しいか確認
2. 動画が公開状態か確認（非公開動画は表示できません）
3. ブラウザのキャッシュをクリア

## 🚀 編集後の確認方法

### 本番サイトでの確認
1. https://sasakiyoshimasa.com で該当記事にアクセス
2. YouTube Shortsが正しく表示されるか確認
3. レスポンシブ表示（スマホ・タブレット）の確認

### Sanity Studioでの確認
1. 編集した記事をSanity Studioで再度開く
2. YouTube Shortsが正しく保存されているか確認
3. プレビュー機能で表示を確認

---

## 📊 作業進捗管理

### 編集完了記事の管理方法
- 編集完了した記事にタグ「youtube-added」を追加
- または別途スプレッドシートで管理

### 推奨作業ペース
- **1日10-15記事**: 無理のないペース
- **1週間で100記事**: 集中的に作業する場合
- **1ヶ月で全324記事**: 継続的に作業する場合

**🎯 これで324記事すべてにYouTube Shorts機能を追加できます！**

効率的に作業を進めて、富山ブログの魅力をさらに向上させましょう！
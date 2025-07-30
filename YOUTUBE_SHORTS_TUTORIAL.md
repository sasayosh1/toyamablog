# 🎬 YouTube Shorts記事作成チュートリアル

## ✅ 準備完了！

- ✅ Sanity Studio: http://localhost:4321/studio
- ✅ メインサイト: http://localhost:4321/
- ✅ プロジェクトID: ef65ti2e
- ✅ スキーマデプロイ済み

## 📝 YouTube Shorts記事作成手順

### 1. Sanity Studioにアクセス
ブラウザで http://localhost:4321/studio を開く

### 2. 新しいブログ記事を作成
- 「Create」ボタンをクリック
- 「ブログ記事」を選択

### 3. 基本情報を入力
- **タイトル**: 「富山の美しい景色をYouTube Shortsで紹介」
- **スラッグ**: 自動生成される（手動編集も可能）
- **説明**: 「富山県の魅力的な風景をYouTube Shortsで短時間で楽しめる動画として紹介」
- **公開日**: 今日の日付（自動設定）
- **タグ**: 「富山」「YouTube Shorts」「風景」

### 4. 記事内容を作成

#### 4.1 見出しを追加
- 「+ Add item」をクリック
- 「Block」を選択
- スタイルを「Heading 2」に変更
- テキスト: 「富山の絶景をショート動画で」

#### 4.2 説明文を追加
- 「+ Add item」をクリック
- 「Block」を選択
- テキスト: 「富山県は日本海側に位置し、美しい自然景観で知られています。特に立山連峰の雄大な山々は一見の価値があります。」

#### 4.3 YouTube Shortsを追加 🎯
- **「+ Add item」をクリック**
- **「YouTube Shorts」を選択**
- **URL**: テスト用YouTube URL（例: `https://www.youtube.com/shorts/dQw4w9WgXcQ`）
- **動画タイトル**: 「立山連峰の美しい風景」
- **自動再生**: オフ
- **コントロールを表示**: オン

#### 4.4 終わりの文章を追加
- 「+ Add item」をクリック
- 「Block」を選択
- テキスト: 「このような短い動画でも、富山の魅力を十分に感じていただけると思います。」

### 5. 記事を公開
- 右上の「Publish」ボタンをクリック

## 🎉 確認方法

### ブログ一覧ページで確認
http://localhost:4321/blog にアクセスして、作成した記事が表示されるか確認

### 個別記事ページで確認
http://localhost:4321/blog/[スラッグ名] にアクセスして、YouTube Shortsが正しく表示されるか確認

## 🔧 対応しているYouTube URL形式

✅ **対応形式**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

❌ **未対応形式**:
- `youtube.com/watch?v=VIDEO_ID` (httpsなし)
- `www.youtube.com/watch?v=VIDEO_ID` (httpsなし)

## 💡 テスト用YouTube URL

以下のURLでテストできます：
- Shorts形式: `https://www.youtube.com/shorts/jNQXAC9IVRw`
- 通常形式: `https://www.youtube.com/watch?v=jNQXAC9IVRw`
- 短縮形式: `https://youtu.be/jNQXAC9IVRw`

## 🎨 表示される要素

### YouTube Shortsコンポーネントの機能:
- 📱 縦長レスポンシブ表示（9:16アスペクト比）
- 🎬 自動再生設定
- 🎛️ コントロール表示/非表示
- 📝 動画タイトル表示
- ⚠️ 無効URL検証とエラー表示
- 📐 デバイス別サイズ調整

これで YouTube Shorts を含む記事が完成です！🎉
# 🎬 手動でYouTube Shorts記事を作成

## 📍 現在の状況
- ✅ Sanity Studio: http://localhost:4321/studio （ブラウザで開いてください）
- ✅ メインサイト: http://localhost:4321/
- ✅ プロジェクトID: ef65ti2e
- ✅ スキーマデプロイ済み

## 🎯 手順（5分で完了）

### 1. Sanity Studioにアクセス
ブラウザで **http://localhost:4321/studio** を開く

### 2. 新しい記事を作成
- 青い **「Create」** ボタンをクリック
- **「ブログ記事」** を選択

### 3. 基本情報を入力

**📝 入力内容：**
- **タイトル**: `富山の美しい景色をYouTube Shortsで紹介`
- **説明**: `富山県の魅力的な風景をYouTube Shortsで短時間で楽しめる動画として紹介します`
- **タグ**: `富山` `YouTube Shorts` `風景` `立山連峰`
- **公開日**: 今日の日付（自動設定）

### 4. 記事内容を作成

#### 4.1 見出しを追加
- **「+ Add item」** をクリック
- **「Block」** を選択  
- スタイルを **「Heading 2」** に変更
- テキスト: `富山の絶景をショート動画で`

#### 4.2 説明文を追加
- **「+ Add item」** をクリック
- **「Block」** を選択
- テキスト: `富山県は日本海側に位置し、美しい自然景観で知られています。特に立山連峰の雄大な山々は一見の価値があります。`

#### 4.3 🎬 YouTube Shortsを追加（重要！）
- **「+ Add item」** をクリック
- **「YouTube Shorts」** を選択
- **URL**: `https://www.youtube.com/shorts/jNQXAC9IVRw`
- **動画タイトル**: `立山連峰の美しい風景（デモ動画）`
- **自動再生**: オフ
- **コントロールを表示**: オン

#### 4.4 追加のテキスト
- **「+ Add item」** をクリック
- **「Block」** を選択
- テキスト: `YouTube Shortsの縦長フォーマットは、スマートフォンでの視聴に最適化されており、短時間で印象的な映像を楽しむことができます。`

#### 4.5 2つ目のYouTube Shorts
- **「+ Add item」** をクリック
- **「YouTube Shorts」** を選択
- **URL**: `https://youtu.be/dQw4w9WgXcQ`
- **動画タイトル**: `YouTube短縮URLのテスト`

### 5. 記事を公開
- 右上の **「Publish」** ボタンをクリック

## 🎉 確認方法

### ✅ ブログ一覧で確認
http://localhost:4321/blog にアクセス → 作成した記事が表示される

### ✅ 個別記事で確認  
http://localhost:4321/blog/toyama-youtube-shorts-demo にアクセス → YouTube Shortsが縦長で表示される

## 🔧 対応しているYouTube URL

✅ **使える形式**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID` 
- `https://youtu.be/VIDEO_ID`

## 💡 テスト用URL

**推奨テストURL**:
- Shorts: `https://www.youtube.com/shorts/jNQXAC9IVRw`
- 通常: `https://www.youtube.com/watch?v=jNQXAC9IVRw`
- 短縮: `https://youtu.be/jNQXAC9IVRw`

---

**🚀 これでYouTube Shortsを含む記事が完成します！**

Sanity Studioで作成後、ブログページでYouTube Shortsが縦長レスポンシブ表示されることを確認してください。
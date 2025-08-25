# Googleマップ追加の標準手順

## 概要
富山ブログの記事にGoogleマップを追加する際の標準手順とベストプラクティス

## 事前準備

### 1. 正確な住所・位置情報の確認
- 公式ウェブサイトで住所を確認
- Google検索で施設名 + 住所で検索
- 富山県や各市町村の公式サイトで確認
- 複数のソースで住所を照合

### 2. 施設情報の収集
- 正式名称の確認
- 営業時間・定休日
- 駐車場の有無
- アクセス方法（電車・バス・車）

## マップ追加手順

### 1. Sanityでの作業手順

```javascript
// 記事ID確認
const article = await client.fetch(`*[_type == "post" && slug.current == "記事スラッグ"][0] { _id, title, body }`);

// マップブロック作成
const googleMapBlock = {
  _type: 'html',
  _key: 'googlemap-施設名-' + Date.now(),
  html: `マップHTMLコード`
};

// 記事の最後に追加
const updatedBody = [...(article.body || [])];
updatedBody.push(googleMapBlock);

// 更新実行
await client.patch(articleId).set({ body: updatedBody }).commit();
```

### 2. HTMLテンプレート

**📋 重要: 2025年8月22日更新**
マップの上下テキスト（タイトルと説明文）は不要です。シンプルなiframeのみを使用してください。

```html
<iframe 
  src="Googleマップ埋め込みURL" 
  width="100%" 
  height="300" 
  style="border:0; border-radius: 8px;" 
  allowfullscreen="" 
  loading="lazy" 
  referrerpolicy="no-referrer-when-downgrade">
</iframe>
```

**🚫 使用禁止 - 以下のようなテキスト付きは使わない:**
```html
<!-- ❌ このような形式は使用しない -->
<div style="padding: 15px; background: #f8f9fa;">
  <h4>📍 施設名の場所</h4>
  <iframe src="..."></iframe>
  <p>施設の説明</p>
</div>
```

### 3. Googleマップ埋め込みURL生成
1. Google Mapsで正確な住所を検索
2. 「共有」ボタンをクリック
3. 「地図を埋め込む」を選択
4. サイズを「カスタム」に設定（幅100%、高さ300px）
5. HTMLコードをコピー
6. iframeのsrc属性値を取得

## 品質チェックリスト

### 地図の精度確認
- [ ] 正確な住所が表示されているか
- [ ] 施設名がマップ上に表示されているか
- [ ] 周辺のランドマークが適切に表示されているか
- [ ] ズームレベルが適切か（施設周辺が見やすい）

### レスポンシブ対応
- [ ] モバイルでの表示確認
- [ ] タブレットでの表示確認
- [ ] PC（大画面）での表示確認

### アクセシビリティ
- [ ] 適切なalt属性の設定
- [ ] キーボードナビゲーション対応
- [ ] 読み上げソフト対応

## 実装例

### 成功例：大岩山日石寺（2025年8月22日更新版）
```javascript
const googleMapBlock = {
  _type: 'html',
  _key: 'googlemap-daiiwayama-nissekiji-' + Date.now(),
  html: `<iframe src="正確なGoogleマップURL" width="100%" height="300" style="border:0; border-radius: 8px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
};
```

**✅ シンプルで効果的:**
- 不要なテキストなし
- iframeのみの表示
- レスポンシブ対応
- 丸角とボーダーなしのスタイル

## 注意事項

### セキュリティ
- HTMLインジェクション対策として、信頼できるGoogleマップのみ使用
- 外部スクリプトは含めない
- iframeのsandbox属性は適切に設定

### パフォーマンス
- `loading="lazy"`属性で遅延読み込み
- 必要以上に大きなマップサイズは避ける
- キャッシュ設定の確認

### SEO対策
- 構造化データでの位置情報マークアップ
- 適切な見出しタグの使用
- 地域名を含むマップ説明文

## トラブルシューティング

### よくある問題
1. **マップが表示されない**
   - iframe URLの確認
   - CORS設定の確認
   - HTMLエスケープの確認

2. **位置が正確でない**
   - 住所の再確認
   - 座標の手動調整
   - 複数の地図サービスでの照合

3. **モバイルでの表示崩れ**
   - レスポンシブCSS設定の確認
   - viewportの設定確認

## 更新履歴
- 2025-08-22: **重要更新** - マップの上下テキスト削除、シンプルiframe形式に変更
- 2024-08-21: 初版作成（大岩山日石寺対応）

## ⚡ 2025年8月22日の重要変更
- **全ての既存記事**: マップの上下テキストを削除済み
- **今後の記事**: シンプルなiframeのみ使用
- **理由**: ユーザビリティ向上とデザイン統一

## ⚠️ 重要な注意事項
**指示されていない変更は絶対に行わないこと**
- 記事のサムネイル表示機能を勝手に変更しない
- 既存の動作している機能には触れない
- 明確に指示された作業のみを実行する
- 「指示したものだけ」をやること

## 📺 YouTube動画サムネイル統一ルール
**記事に追加した動画のサムネイルと同じものをブログ記事のサムネイルに反映させること**

### 基本方針
- 記事に追加したYouTube動画のサムネイルと記事カードのサムネイルを完全に統一
- ユーザーが動画と記事の関連性を一目で理解できるようにする
- ブランディングの一貫性を保つ

### 実装方法
1. **YouTube URLの設定**: 記事にyoutubeUrlフィールドを設定
2. **自動サムネイル取得**: システムがYouTube URLからサムネイルを自動取得
3. **表示統一**: PostCardコンポーネントで同じサムネイルを表示

### 技術仕様
```javascript
// サムネイル取得関数（youtube.ts）
export function getYouTubeThumbnailWithFallback(url: string): string | null {
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch || !videoIdMatch[1]) return null;
  const videoId = videoIdMatch[1];
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
```

### 品質基準
- **解像度**: mqdefault.jpg（320x180px）を使用
- **フォールバック**: 動画が削除された場合のSVGフォールバック
- **レスポンシブ**: 全デバイスで適切に表示

### チェックリスト
- [ ] YouTube動画のサムネイルが記事カードに表示されているか
- [ ] サムネイルが動画内容と一致しているか
- [ ] モバイル・タブレット・PCで正常表示されるか
- [ ] 動画削除時のフォールバック表示が適切か

## 🎯 サムネイル設定の標準運用ルール（2025年8月22日追加）

### 新規記事作成時の必須ルール
**記事に追加した動画のサムネイルと同じものをブログ記事のサムネイルに反映させること**

#### 基本原則
1. **動画追加 = サムネイル反映**: 記事にYouTube動画を追加した場合、必ずその動画と同じサムネイルをブログ記事のサムネイルに反映させる
2. **一番最初の動画を採用**: 記事内に複数の動画がある場合は、一番最初の動画のサムネイルをブログ記事のサムネイルに反映させる
3. **即座に反映**: 動画URLを設定したら、即座にサムネイルもブログ記事に反映させる

#### 実装手順
```javascript
// 1. 記事にYouTube URLを追加
await client.patch(articleId).set({ youtubeUrl: "動画URL" }).commit();

// 2. 同時にサムネイルも設定（必須）
const videoId = extractVideoId("動画URL");
const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
const imageAsset = await createImageAssetFromUrl(thumbnailUrl, articleTitle);

await client.patch(articleId).set({
  thumbnail: {
    _type: 'image',
    asset: { _type: 'reference', _ref: imageAsset._id },
    alt: articleTitle + ' サムネイル'
  }
}).commit();
```

#### 複数動画がある場合の優先順位
1. **youtubeUrlフィールド**: 記事のメイン動画として設定されているもの
2. **記事内の最初の動画**: 本文中で最初に登場する動画
3. **埋め込み順**: HTMLブロックやyoutubeブロックの登場順

#### 運用チェックポイント
- [ ] 動画追加時にサムネイルも同時設定したか
- [ ] 複数動画の場合、最初の動画のサムネイルを使用したか
- [ ] サムネイル画像が正常に表示されるか
- [ ] 記事カードとYouTube動画のサムネイルが一致しているか

### 📋 作業者への重要指示
**この運用ルールは必ず守ること。動画を追加してサムネイルを設定しない記事は不完全とみなされます。**

## 🔧 既存記事のサムネイル設定不備対応（2025年8月22日追記）

### サムネイル自動処理でエラーが発生した記事への対応
**198記事の自動処理で55記事にエラーが発生しました。これらの記事については以下の対応を行うこと：**

#### エラー記事の対応ルール
1. **記事編集時の必須作業**: エラーが発生した記事を編集する際は、必ず追加した動画と同じサムネイルをブログ記事のサムネイルに反映させる
2. **動画追加時の対応**: 既存記事に新しい動画を追加する場合も、同様に動画のサムネイルをブログ記事のサムネイルに反映させる
3. **優先度**: エラー記事は通常記事より高い優先度でサムネイル反映を行う

#### エラーの主な原因と対処法（2025年8月24日調査結果更新）

**🔍 詳細調査の結果判明した事実：**

1. **YouTube Shortsでもサムネイル取得は可能**
   - 成功事例：yeMbIMxqC1o, qnRZHR3HHMw, JhGMbTOeK88 など
   - 既存記事の9/10がYouTube Shortsでサムネイル反映済み

2. **動画固有の問題**
   - 一部の動画でのみHTTP 404エラーが発生
   - 動画ページは正常だが、サムネイル画像のみアクセス不可
   - 原因：YouTube側での個別動画のサムネイル生成状況による

3. **成功パターン**
   - 最近の動画（2025年8月18日以降）：サムネイル取得成功率が高い
   - 古い動画：サムネイル取得失敗率が高い

#### 実際の対処法
- **有効なサムネイル**を持つ動画：自動反映可能
- **無効なサムネイル**の動画：手動設定または代替方法が必要
- **動画ごとの事前チェック**：サムネイルURL有効性確認後に処理実行

#### 重要な注意事項
**YouTube Shorts自体に問題はなく、個別動画のサムネイル生成状況に依存。事前チェックにより対応可能。**

#### 手動設定の実装手順
```javascript
// エラー記事のサムネイル手動設定
async function setThumbnailManually(articleId, videoUrl, title) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return;
    
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    const imageAsset = await createImageAssetFromUrl(thumbnailUrl, title);
    
    await client.patch(articleId).set({
      thumbnail: {
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id },
        alt: title + ' サムネイル'
      }
    }).commit();
  } catch (error) {
    console.error('手動サムネイル設定エラー:', error);
  }
}
```

#### チェックリスト（エラー記事専用）
- [ ] 動画URLが有効かどうか確認済み
- [ ] サムネイル画像が存在するか確認済み
- [ ] 手動でのサムネイル設定を実行済み
- [ ] 記事カードでサムネイルが正常表示されるか確認済み

### 重要事項
**エラーが発生した記事については、今後の編集時に必ず追加した動画のサムネイルと同じものをブログ記事のサムネイルに反映させること。これにより最終的に全記事でサムネイルが統一される。**
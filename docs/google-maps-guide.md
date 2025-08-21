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

```html
<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
  <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 施設名の場所</h4>
  <iframe 
    src="Googleマップ埋め込みURL" 
    width="100%" 
    height="300" 
    style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
    allowfullscreen="" 
    loading="lazy" 
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
  <p style="margin-top: 10px; font-size: 14px; color: #666;">施設の簡潔な説明</p>
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

### 成功例：大岩山日石寺
```javascript
const googleMapBlock = {
  _type: 'html',
  _key: 'googlemap-daiiwayama-nissekiji-' + Date.now(),
  html: `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;">
    <h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 大岩山日石寺の場所</h4>
    <iframe src="正確なGoogleマップURL" width="100%" height="300" 
      style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
      allowfullscreen="" loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
    <p style="margin-top: 10px; font-size: 14px; color: #666;">
      滝行体験もできる真言密宗大本山の古刹です
    </p>
  </div>`
};
```

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
- 2024-08-21: 初版作成（大岩山日石寺対応）
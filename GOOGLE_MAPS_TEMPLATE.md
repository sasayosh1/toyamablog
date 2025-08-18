# Googleマップ埋め込みテンプレート

## 今後の記事で使用するGoogleマップのHTMLテンプレート

```html
<div style="margin: 20px 0; text-align: center;">
  <iframe src="[GOOGLE_MAPS_EMBED_URL]" 
    width="100%" height="300" 
    style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
    allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</div>
```

## 重要な注意点

- **テキストは一切追加しない**（上下にタイトルや説明文を入れない）
- シンプルなマップのみを表示
- 角丸とシャドウ効果を適用
- レスポンシブ対応（width="100%"）
- 高さは300pxで統一

## Sanity用のブロック構造

```javascript
{
  _type: 'html',
  _key: 'googlemap-' + Date.now(),
  html: '[上記のHTMLテンプレート]'
}
```
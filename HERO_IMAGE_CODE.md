# ヒーロー画像実装コード

画像をアップロード後、以下のコードで `src/app/page.tsx` の該当部分を置き換えてください。

## 現在のグラデーション背景

```tsx
<div className="relative h-96 md:h-[500px] overflow-hidden bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800">
  {/* 富山らしい山と川をイメージしたグラデーション背景 */}
  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-white/10" />
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800/50 to-transparent" />
  
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center text-white px-4">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
        TOYAMA BLOG
      </h1>
      <p className="text-xl md:text-2xl text-gray-100 drop-shadow-md">
        富山の美しい風景と魅力を発信
      </p>
    </div>
  </div>
  
  {/* 画像アップロード用のコメント */}
  <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
    画像: /public/images/toyama-hero.jpg にアップロード予定
  </div>
</div>
```

## 画像アップロード後の推奨コード

```tsx
<div className="relative h-96 md:h-[500px] overflow-hidden">
  <Image
    src="/images/toyama-hero.jpg"
    alt="富山市の風景 - 立山連峰を背景にした橋と川"
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-black bg-opacity-40" />
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center text-white px-4">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
        TOYAMA BLOG
      </h1>
      <p className="text-xl md:text-2xl text-gray-100 drop-shadow-md">
        富山の美しい風景と魅力を発信
      </p>
    </div>
  </div>
</div>
```

## 手順

1. `/public/images/toyama-hero.jpg` に画像を配置
2. 上記の「画像アップロード後の推奨コード」で置き換え
3. 不要なコメント部分を削除
4. 開発サーバーで確認: `npm run dev`
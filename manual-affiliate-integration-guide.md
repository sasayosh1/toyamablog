# 手動アフィリエイトリンク統合ガイド

## 🎯 即座に実装可能な推奨アクション

### 1. 既存のアフィリエイトAPI活用

現在のシステムでは `/api/affil/inject` エンドポイントが利用可能です。以下のように活用できます：

```javascript
// 記事コンテンツにアフィリエイトリンクを自動挿入
const response = await fetch('/api/affil/inject', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'html', // または 'mdx'
    content: articleContent
  })
});

const result = await response.json();
// result.result に挿入済みコンテンツが含まれます
```

### 2. 優先実装記事リスト

以下の記事から順次実装することを強く推奨します：

#### 🥇 最優先（適合スコア100+）

1. **氷見市ヒミツノアソビバ記事**
   - URL: `/blog/himi-city-1757253039364`
   - 適合スコア: 148点
   - 推奨プログラム: `airtrip_plus_toyama`

2. **富山駅前ケーキ店記事**
   - URL: `/blog/toyama-city-cake-station`
   - 適合スコア: 132点
   - 推奨プログラム: `airtrip_plus_toyama` + `tripadvisor`

#### 🥈 高優先（適合スコア50-99）

3. **氷見市吉がけ牧場記事**
   - URL: `/blog/himi-city-yoshigake-farm-goat-slow-life-experience`
   - 適合スコア: 64点

4. **富山市りんご飴専門店記事**
   - URL: `/blog/toyama-city-candy-apple-maroot`
   - 適合スコア: 64点

5. **高岡市ペンギン記事**
   - URL: `/blog/takaoka-city-1756354793286`
   - 適合スコア: 60点

### 3. 具体的な挿入コード例

#### HTMLコンテンツの場合

```html
<!-- 氷見市記事での実装例 -->
<p>氷見市の「ヒミツノアソビバ」は、地域愛溢れるオリジナルグッズが魅力のお店です。</p>

<!-- 自然な流れでアフィリエイトリンク挿入 -->
<div class="affiliate-section" style="margin: 1.5rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
  <p><strong>💡 氷見市観光をお考えの方へ</strong></p>
  <p>氷見市には「ヒミツノアソビバ」以外にも海の幸やひみ牛など魅力がたくさん！</p>
  <span data-affil="airtrip_plus_toyama"></span>
</div>

<p>次の段落の内容...</p>
```

#### MDXコンテンツの場合

```mdx
氷見市の「ヒミツノアソビバ」は、地域愛溢れるオリジナルグッズが魅力のお店です。

<Affil id="airtrip_plus_toyama" />

**営業情報・アクセス**
```

### 4. 既存システムとの統合方法

#### A. Sanity CMSでの手動編集

1. Sanity Studioにログイン
2. 対象記事を開く
3. 推奨挿入位置に以下を追加：

```html
<!-- Sanityのrich textエディタで -->
<span data-affil="airtrip_plus_toyama" style="display: none;"></span>
```

#### B. プログラマティック更新

```javascript
// pages/blog/[slug].js または該当するページコンポーネントで
import { AffilScript } from '@/components/AffilScript';

export default function BlogPost({ post }) {
  // 記事コンテンツの処理時にアフィリエイトリンクを自動挿入
  const processedContent = useAffiliateInjection(post.body);

  return (
    <div>
      {/* 既存のコンテンツ */}
      <PortableText value={processedContent} />
      <AffilScript />
    </div>
  );
}
```

### 5. A/Bテスト設定

#### 実装フェーズ1: 最優先記事のみ（1週間）

- 氷見市ヒミツノアソビバ記事のみ
- クリック率とユーザー行動を監視

#### 実装フェーズ2: 高優先記事追加（2-3週間）

- 残りの4記事を追加
- 効果測定と調整

#### 実装フェーズ3: 全記事展開（1ヶ月）

- 分析結果に基づいた全記事への展開

### 6. 効果測定のためのトラッキング

```javascript
// アフィリエイトリンクのクリック追跡
document.addEventListener('click', function(e) {
  const affiliateLink = e.target.closest('[data-affil]');

  if (affiliateLink) {
    const programId = affiliateLink.getAttribute('data-affil');
    const articleSlug = window.location.pathname.split('/').pop();

    // Google Analytics 4 イベント送信
    gtag('event', 'affiliate_click', {
      'program_id': programId,
      'article_slug': articleSlug,
      'click_position': getClickPosition(affiliateLink)
    });
  }
});
```

### 7. 収益予測

#### 保守的予測（月間）
- **PV**: 10,000-15,000/月（想定）
- **クリック率**: 1.5-2.5%
- **コンバージョン率**: 0.3-0.8%
- **予想収益**: ¥8,000-¥15,000

#### 楽観的予測（最適化後）
- **PV**: 15,000-25,000/月
- **クリック率**: 3-5%
- **コンバージョン率**: 1-2%
- **予想収益**: ¥25,000-¥50,000

### 8. 注意事項とベストプラクティス

#### ✅ 推奨する取り組み

- **自然な挿入**: コンテンツの流れを阻害しない
- **価値提供**: 読者にとって有益な情報と組み合わせ
- **適度な頻度**: 1記事につき1-3個まで
- **関連性重視**: 記事内容と関連性の高いプログラムを選択

#### ❌ 避けるべき行為

- **過度な挿入**: 記事の読みやすさを損なう
- **無関係なリンク**: コンテンツと無関係なプログラムの推奨
- **押し売り感**: 明らかに商業的すぎる表現
- **ユーザビリティ低下**: モバイル表示での不具合

### 9. 次のステップ

1. **即座に実施**
   - 最優先記事（氷見市ヒミツノアソビバ）への手動リンク挿入
   - クリック率の初期測定開始

2. **1週間以内**
   - 残り4記事への段階的展開
   - A/Bテスト環境の構築

3. **1ヶ月以内**
   - 効果測定と最適化
   - 自動化システムの検討

---

*このガイドは分析結果に基づいた実践的な実装方法を提供しています。段階的な実装により、リスクを最小化しながら収益機会を最大化できます。*
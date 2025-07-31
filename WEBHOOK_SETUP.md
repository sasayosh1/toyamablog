# Sanity Webhook設定ガイド

## 概要
記事の公開・更新時に自動でサイトキャッシュを更新するWebhook設定手順

## 1. Sanity Studio での Webhook 設定

### 1.1 Sanity Studio にアクセス
- https://sasakiyoshimasa.com/studio または https://your-project.sanity.studio
- 管理者権限でログイン

### 1.2 Webhook 作成
1. **Settings** → **API** → **Webhooks** → **Create webhook**
2. 以下の設定を入力:

**基本設定:**
- **Name**: `TOYAMA Blog Revalidation`
- **URL**: `https://sasakiyoshimasa.com/api/revalidate`
- **Dataset**: `production`
- **HTTP method**: `POST`

**Headers:**
```
Authorization: Bearer blog_revalidate_secret_2025_secure_token_xyz
Content-Type: application/json
```

**Trigger on:**
- ✅ **Create**
- ✅ **Update** 
- ✅ **Delete**

**Filter:**
```groq
_type == "post"
```

**Projection (カスタムペイロード):**
```json
{
  "type": _type,
  "slug": slug.current,
  "title": title,
  "action": "revalidate"
}
```

## 2. 動作確認

### 2.1 手動テスト
```bash
# 全体再検証
curl -X POST "https://sasakiyoshimasa.com/api/revalidate?secret=blog_revalidate_secret_2025_secure_token_xyz" \
  -H "Content-Type: application/json" \
  -d '{"type":"post","slug":"test-slug"}'

# 特定タグ再検証
curl -X GET "https://sasakiyoshimasa.com/api/revalidate?secret=blog_revalidate_secret_2025_secure_token_xyz&tag=posts"

# 特定パス再検証  
curl -X GET "https://sasakiyoshimasa.com/api/revalidate?secret=blog_revalidate_secret_2025_secure_token_xyz&path=/"
```

### 2.2 Sanity からのテスト
1. Sanity Studio で記事を編集・保存
2. Webhook ログで送信確認: **Settings** → **API** → **Webhooks** → 該当Webhook → **Logs**
3. サイトで更新反映確認（通常1-2分以内）

## 3. トラブルシューティング

### 3.1 Webhook が発火しない
- **Filter** が正しいか確認: `_type == "post"`
- **Dataset** が `production` になっているか確認
- Webhook URL にアクセス権限があるか確認

### 3.2 401 Unauthorized エラー
- `Authorization` ヘッダーの `Bearer` トークンが正しいか確認
- Vercel環境変数 `REVALIDATE_SECRET` が設定されているか確認

### 3.3 記事が反映されない
```bash
# キャッシュ状態確認
curl -I https://sasakiyoshimasa.com/blog/your-post-slug

# age=0 になっていれば更新済み
# x-vercel-cache: MISS または STALE → HIT で正常
```

### 3.4 緊急時の全体キャッシュクリア
```bash
# 全記事一覧
curl -X GET "https://sasakiyoshimasa.com/api/revalidate?secret=blog_revalidate_secret_2025_secure_token_xyz&tag=posts"

# ホームページ
curl -X GET "https://sasakiyoshimasa.com/api/revalidate?secret=blog_revalidate_secret_2025_secure_token_xyz&path=/"
```

## 4. Webhook ペイロード例

**記事公開時:**
```json
{
  "type": "post",
  "slug": "toyama-city-example",
  "title": "【富山市】サンプル記事",
  "action": "revalidate"
}
```

**レスポンス例:**
```json
{
  "revalidated": true,
  "timestamp": "2025-01-31T01:30:00.000Z",
  "tags": ["posts", "post-toyama-city-example"],
  "paths": ["/", "/blog/toyama-city-example"]
}
```

## 5. セキュリティ

- **REVALIDATE_SECRET**: 32文字以上のランダム文字列を使用
- Webhook URL は HTTPS のみ
- 必要に応じて IP 制限を Vercel で設定可能

## 6. 監視・ログ

- Webhook 実行ログ: Sanity Studio → Settings → API → Webhooks → Logs
- Vercel Function ログ: Vercel Dashboard → Functions → /api/revalidate
- Next.js 再検証ログ: サーバーコンソールで `[Revalidate]` を確認
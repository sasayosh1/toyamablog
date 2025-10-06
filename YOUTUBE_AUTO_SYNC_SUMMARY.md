# YouTube自動同期システム - 設定完了サマリー

## 📋 システム概要

YouTubeチャンネル「富山のくせに」に新しい富山県の動画が投稿されると、自動的にSanityブログ記事を作成するシステムです。

---

## ✅ 完了した設定

### 1. 環境変数設定（`.env.local`）

```bash
# YouTube API設定
YOUTUBE_CHANNEL_ID=UCxX3Eq8_KMl3AeYdhb5MklA
YOUTUBE_API_KEY=AIzaSyAMWFYGFOzXqUic0agFSgXqWecywK9__zg

# Google Maps API設定
GOOGLE_MAPS_API_KEY=AIzaSyAH5oKyGm1EnibGH6JxlrEwMyRUIpzvEgI

# Sanity API設定
SANITY_API_TOKEN=skDJBUxYdroSpAOP8XldNALmecS9utW4Vb0JcE4MWcJQOt6RG0AT3xAdLXrlmTNJEtlsFiR3lBFY8h8GKjlCv2kyDnns0VMMq57tmRDQYE6wNQkWcWa8JKLrOrSG9MVjFUQRX6yRd3WB4pLrCoQYpBNZoMk6c2uXgpDO1Esv6TcNfKA8IVgC
```

### 2. スクリプトファイル

#### メイン処理スクリプト
- **パス**: `scripts/check-youtube-and-create-articles.cjs`
- **機能**:
  - YouTube Data APIから最新10件の動画を取得
  - 1ヶ月以内の動画を処理対象
  - 富山県の市町村名を自動検出
  - カテゴリを自動判定
  - 1,500-2,000文字の記事を自動生成
  - Sanityに自動公開

#### 自動実行ラッパースクリプト
- **パス**: `scripts/auto-youtube-sync.sh`
- **機能**:
  - 環境変数の自動読み込み
  - ログファイル自動生成
  - エラーハンドリング
  - 古いログの自動削除（30日以上）

#### npmスクリプト（`package.json`）
```json
{
  "scripts": {
    "youtube:sync": "./scripts/auto-youtube-sync.sh"
  }
}
```

### 3. Google API設定

#### YouTube Data API v3
- **APIキー**: `AIzaSyAMWFYGFOzXqUic0agFSgXqWecywK9__zg`
- **制限設定**:
  - ✅ アプリケーション制限: なし（サーバースクリプト用）
  - ✅ API制限: YouTube Data API v3 のみ
- **状態**: ✅ 有効・動作確認済み

#### Sanity API
- **プロジェクトID**: `aoxze287`
- **データセット**: `production`
- **トークン権限**: Editor
- **状態**: ✅ 有効・動作確認済み

---

## 🎯 動作条件

### 処理対象となる動画

1. ✅ **期間**: 1ヶ月以内に公開された動画
2. ✅ **地域**: タイトルまたは説明文に富山県の市町村名が含まれる
3. ✅ **重複**: 既存記事が存在しない動画のみ

### 対応地域（15市町村）

| 市町村 | スラッグ | 検出キーワード |
|--------|----------|----------------|
| 富山市 | toyama-city | 富山市 |
| 高岡市 | takaoka-city | 高岡市 |
| 射水市 | imizu-city | 射水市 |
| 氷見市 | himi-city | 氷見市 |
| 砺波市 | tonami-city | 砺波市 |
| 小矢部市 | oyabe-city | 小矢部市 |
| 南砺市 | nanto-city | 南砺市 |
| 魚津市 | uozu-city | 魚津市 |
| 黒部市 | kurobe-city | 黒部市 |
| 滑川市 | namerikawa-city | 滑川市 |
| 上市町 | kamiichi-town | 上市町 |
| 立山町 | tateyama-town | 立山町 |
| 入善町 | nyuzen-town | 入善町 |
| 朝日町 | asahi-town | 朝日町 |
| 舟橋村 | funahashi-village | 舟橋村 |

### カテゴリ自動判定ルール

**⚠️ 重要**: カテゴリは必ず地域名を使用（CLAUDE.mdルール準拠）

| キーワード | カテゴリ判定 | 実際の設定 |
|-----------|------------|-----------|
| 寺院、神社、お寺 | 神社・寺院 | 【氷見市】等の地域名 |
| グルメ、レストラン、カフェ | グルメ | 【氷見市】等の地域名 |
| 公園、桜、自然、山、海 | 自然・公園 | 【富山市】等の地域名 |
| 温泉、ホテル、宿泊 | 温泉・宿泊 | 【氷見市】等の地域名 |
| イベント、祭り、花火 | イベント・祭り | 【富山市】等の地域名 |

**注意**: 上記は内部判定用で、Sanityのカテゴリには必ず【】内の地域名を設定します。

---

## 📝 自動生成される記事の内容

### 記事構造（CLAUDE.mdルール準拠）

1. **H1タイトル**: 動画タイトル（【地域名】含む）
2. **YouTube動画埋め込み**
3. **導入文**（2-3行）
4. **H2見出し1**: 地域について
5. **H2見出し2**: スポットの魅力
6. **H2見出し3**: 楽しみ方・体験内容
7. **H2見出し4**: アクセス・利用情報
8. **H2まとめ**: まとめセクション
9. **Googleマップ**: 地域の地図
10. **タグ**: 10個程度の最適化されたタグ

### 文字数
- **目標**: 1,500-2,000文字
- **目的**: スマホ読みやすさ最優先

### 自動設定項目
- ✅ タイトル: YouTube動画タイトル
- ✅ スラッグ: `{地域スラッグ}-{タイムスタンプ}`
- ✅ カテゴリ: 地域名（【富山市】等）
- ✅ タグ: 富山、富山県、地域名、カテゴリ等
- ✅ YouTube URL: 埋め込み形式
- ✅ 公開日時: 自動設定
- ✅ 著者: ささよし（ID: 95vBmVlXBxlHRIj7vD7uCv）

---

## 🚀 使用方法

### 手動実行

```bash
# プロジェクトディレクトリに移動
cd /Users/user/toyamablog

# 実行
npm run youtube:sync
```

### 自動実行（cronジョブ設定）

#### 毎日午前9時に実行
```bash
# crontabを編集
crontab -e

# 以下を追加
0 9 * * * cd /Users/user/toyamablog && npm run youtube:sync
```

#### その他のスケジュール例

**1日2回（午前9時と午後6時）**
```bash
0 9,18 * * * cd /Users/user/toyamablog && npm run youtube:sync
```

**毎週月曜日午前9時**
```bash
0 9 * * 1 cd /Users/user/toyamablog && npm run youtube:sync
```

**1時間ごと**
```bash
0 * * * * cd /Users/user/toyamablog && npm run youtube:sync
```

---

## 📊 実行結果の確認

### ログファイル

- **場所**: `logs/youtube-sync-YYYYMMDD-HHMMSS.log`
- **保持期間**: 30日間（自動削除）

### 最新ログの確認
```bash
# 最新のログファイルを表示
ls -lt logs/youtube-sync-*.log | head -1

# ログ内容を確認
cat logs/youtube-sync-*.log
```

### 成功時の出力例
```
🔍 YouTubeチャンネルの最新動画をチェック中...
📺 10件の動画を確認中...
🔍 動画チェック中: 【氷見市】地元に愛されたお寺...
📍 検出した地域: 氷見市 (カテゴリ: 神社・寺院)
✅ 新しい記事を作成しました: 【氷見市】...
🎉 処理完了: 1件の新しい記事を作成しました
```

### サイトで確認
https://sasakiyoshimasa.com

---

## ✅ 最終動作確認結果（2025年10月4日）

### テスト実行結果
```
📺 10件の動画を確認
✅ 5件の記事を自動作成
⏭️ 1件はスキップ（既存記事あり）
⏭️ 4件はスキップ（富山県外または期間外）
```

### 作成された記事
1. ✅ 【氷見市】地元に愛されたお寺、藤子不二雄Ａの生家「光禅寺」
2. ✅ 【富山市】GO FOR KOGEI 2025 町歩きとアートを同時に楽しむイベント
3. ✅ 【氷見市】生涯まんが道！潮風ギャラリー藤子不二雄Aアートコレクションの魅力
4. ✅ 【氷見市】富山グルメ必食！老舗喫茶店コーヒーハウス・マイケルの名物焼きカレーがおいしい！
5. ✅ 【氷見市】知られざる廃墟遺産「魚眠洞(ぎょみんどう)」

---

## 🔧 トラブルシューティング

### エラー: "YouTube API Error: API Key not found"
**原因**: APIキーが無効または制限設定が間違っている
**対処**: Google Cloud ConsoleでAPIキーの制限設定を確認

### エラー: "Sanity - Session not found"
**原因**: Sanity APIトークンが無効または期限切れ
**対処**: Sanity管理画面で新しいトークンを作成

### エラー: "Daily Limit Exceeded"
**原因**: YouTube APIのクォータ上限に達した
**対処**: 翌日まで待つ（無料枠: 10,000クォータ/日）

### 動画が処理されない
**確認事項**:
1. 動画が1ヶ月以内に公開されているか
2. タイトルに富山県の市町村名が含まれているか
3. 既に記事が作成されていないか

---

## 📚 関連ドキュメント

- `YOUTUBE_AUTO_SYNC_SETUP.md` - 詳細セットアップガイド
- `YOUTUBE_API_KEY_CHECK.md` - APIキー確認・設定ガイド
- `YOUTUBE_API_RESTRICTION_GUIDE.md` - API制限設定ガイド
- `API_KEY_FIX_GUIDE.md` - APIキー問題の修正ガイド
- `CLAUDE.md` - ブログ記事作成ガイドライン
- `YOUTUBE_SYSTEM_FINAL_SETUP.md` - YouTube API初期設定

---

## 🎯 システムの特徴

### メリット
✅ **完全自動化**: 動画投稿後、記事が自動生成
✅ **SEO最適化**: 地域名、タグ、構造化された記事
✅ **重複防止**: 既存記事は自動スキップ
✅ **ログ管理**: 全実行結果を記録
✅ **エラー耐性**: API制限、ネットワークエラーに対応
✅ **拡張性**: 新しい市町村の追加が容易

### 制限事項
⚠️ YouTube APIクォータ: 10,000/日（無料枠）
⚠️ 処理対象: 富山県の15市町村のみ
⚠️ 期間制限: 1ヶ月以内の動画のみ
⚠️ 動画数: 最新10件まで

---

## 🔒 セキュリティ

### 設定済みのセキュリティ対策
✅ APIキーのAPI制限（YouTube Data API v3のみ）
✅ 環境変数による認証情報管理
✅ .gitignoreで.env.localを除外
✅ Sanity APIトークンのEditor権限

### 将来の推奨設定（本番環境）
- IPアドレス制限の追加
- APIキーの定期ローテーション（3-6ヶ月）
- クォータ監視アラートの設定

---

## 📞 サポート

### 問題が発生した場合

1. **ログファイルを確認**
   ```bash
   cat logs/youtube-sync-*.log
   ```

2. **環境変数を確認**
   ```bash
   cat .env.local
   ```

3. **手動テスト実行**
   ```bash
   npm run youtube:sync
   ```

---

## 🎉 セットアップ完了

すべての設定が完了し、正常に動作しています！

次に富山県の動画が投稿されたら、自動的にブログ記事が作成されます。

**最終確認日**: 2025年10月4日
**ステータス**: ✅ 稼働中

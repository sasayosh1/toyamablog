# YouTube自動同期 - cronジョブ設定完了

## ✅ 設定完了

YouTube自動同期が**毎週土曜日の夜21:00**に自動実行されるようになりました。

---

## 📅 自動実行スケジュール

```
スケジュール: 毎週土曜日 21:00
実行コマンド: npm run youtube:sync
作業ディレクトリ: /Users/user/toyamablog
```

### cronの設定内容
```bash
0 21 * * 6 cd /Users/user/toyamablog && npm run youtube:sync
```

**フォーマット説明**:
```
分 時 日 月 曜日
0  21 *  * 6    = 毎週土曜日の21:00
              └ 6 = 土曜日（0=日曜, 1=月曜, ..., 6=土曜）
```

---

## 🎯 動作内容

### 毎週土曜日21:00に自動実行される処理

1. **YouTube APIから最新動画を取得**
   - チャンネル: 富山のくせに
   - 取得件数: 最新10件

2. **過去30日間の動画を処理**
   - 富山県の市町村名を含む動画のみ対象
   - 既存記事がある場合はスキップ

3. **ブログ記事を自動作成**
   - 1,500-2,000文字の記事
   - YouTube動画埋め込み
   - カテゴリ・タグ自動設定
   - Sanityに自動公開

4. **ログファイルに記録**
   - 実行結果を自動保存
   - 30日以上前のログは自動削除

---

## 📊 実行結果の確認方法

### ログファイルの確認

```bash
# 最新のログファイルを確認
ls -lt /Users/user/toyamablog/logs/youtube-sync-*.log | head -1

# ログ内容を表示
cat /Users/user/toyamablog/logs/youtube-sync-*.log
```

### ログファイルの場所
```
/Users/user/toyamablog/logs/youtube-sync-YYYYMMDD-HHMMSS.log
```

### 成功時のログ例
```
[2025-10-04 21:00:00] YouTube自動同期スクリプト開始
[2025-10-04 21:00:01] 環境変数チェック完了
🔍 YouTubeチャンネルの最新動画をチェック中...
📺 10件の動画を確認中...
✅ 新しい記事を作成しました: 【富山市】...
🎉 処理完了: 2件の新しい記事を作成しました
[2025-10-04 21:00:15] YouTube自動同期完了
```

---

## 🔍 crontabの確認と管理

### 現在の設定を確認
```bash
crontab -l
```

### 設定を編集
```bash
crontab -e
```

### cronジョブを削除
```bash
# YouTube自動同期のジョブのみ削除
crontab -l | grep -v "youtube:sync" | crontab -

# すべてのcronジョブを削除
crontab -r
```

---

## ⏰ スケジュール変更例

cronジョブのスケジュールを変更したい場合:

```bash
# crontabを編集
crontab -e

# 以下の形式で編集
分 時 日 月 曜日 コマンド
```

### よく使うスケジュール例

**毎日実行**
```bash
# 毎日21:00
0 21 * * * cd /Users/user/toyamablog && npm run youtube:sync
```

**週2回実行**
```bash
# 水曜日と土曜日の21:00
0 21 * * 3,6 cd /Users/user/toyamablog && npm run youtube:sync
```

**月曜日の朝**
```bash
# 毎週月曜日 9:00
0 9 * * 1 cd /Users/user/toyamablog && npm run youtube:sync
```

**月1回実行**
```bash
# 毎月1日 21:00
0 21 1 * * cd /Users/user/toyamablog && npm run youtube:sync
```

---

## 🧪 手動テスト実行

cronジョブを待たずに手動で実行したい場合:

```bash
cd /Users/user/toyamablog
npm run youtube:sync
```

---

## 📝 次回実行予定

### 確認方法

次の土曜日21:00に自動実行されます。

**例**:
- 今日が2025年10月4日（金曜日）の場合
- 次回実行: 2025年10月5日（土曜日）21:00

---

## 🎉 セットアップ完了内容

### ✅ 完了した設定

1. **環境変数設定**
   - YouTube API Key
   - Sanity API Token
   - Google Maps API Key

2. **スクリプトファイル**
   - メイン処理スクリプト
   - 自動実行ラッパー
   - npmスクリプト

3. **cronジョブ設定**
   - 毎週土曜日21:00に自動実行
   - ログ自動保存
   - エラーハンドリング

4. **チャンネル設定更新**
   - チャンネル名: 「富山のくせに」に更新
   - チャンネルID: 変更なし（UCxX3Eq8_KMl3AeYdhb5MklA）

---

## 🔔 通知設定（オプション）

cronジョブの実行結果をメールで受け取りたい場合:

```bash
# crontabの先頭に追加
MAILTO=your-email@example.com

# cronジョブ
0 21 * * 6 cd /Users/user/toyamablog && npm run youtube:sync
```

---

## 🆘 トラブルシューティング

### cronジョブが実行されない場合

1. **cronが動作しているか確認**
   ```bash
   # macOSの場合
   sudo launchctl list | grep cron
   ```

2. **cronジョブの構文を確認**
   ```bash
   crontab -l
   ```

3. **パスの確認**
   ```bash
   # コマンドが正しく実行できるか
   cd /Users/user/toyamablog && npm run youtube:sync
   ```

4. **ログファイルを確認**
   ```bash
   ls -lt /Users/user/toyamablog/logs/
   ```

### macOSでcronが動かない場合

macOSではcronにフルディスクアクセス権限が必要な場合があります:

1. システム環境設定 → セキュリティとプライバシー
2. プライバシー → フルディスクアクセス
3. 「cron」を追加

---

## 📚 関連ドキュメント

- `YOUTUBE_AUTO_SYNC_SUMMARY.md` - システム全体のサマリー
- `YOUTUBE_AUTO_SYNC_SETUP.md` - セットアップガイド
- `setup-cron.sh` - cronジョブ設定スクリプト

---

## 🎯 まとめ

**✅ 毎週土曜日の夜21:00に自動実行**
- YouTubeチャンネル「富山のくせに」の新しい動画をチェック
- 富山県の動画を自動的にブログ記事化
- ログファイルに実行結果を記録

**次回実行**: 次の土曜日 21:00
**ログ保存先**: `/Users/user/toyamablog/logs/`

セットアップ完了です！🎊

---

**設定完了日**: 2025年10月4日
**ステータス**: ✅ 稼働中

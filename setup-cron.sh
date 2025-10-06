#!/bin/bash

# cronジョブ設定スクリプト
# 毎週土曜日の夜21:00にYouTube自動同期を実行

echo "YouTube自動同期のcronジョブを設定します"
echo "スケジュール: 毎週土曜日 21:00"
echo ""

# 現在のcrontabをバックアップ
echo "現在のcrontabをバックアップ中..."
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || echo "既存のcrontabはありません"

# 新しいcronジョブ
CRON_JOB="0 21 * * 6 cd /Users/user/toyamablog && npm run youtube:sync"

# 既存の同じジョブを削除してから追加
echo "cronジョブを設定中..."
(crontab -l 2>/dev/null | grep -v "youtube:sync"; echo "$CRON_JOB") | crontab -

echo ""
echo "✅ cronジョブの設定が完了しました！"
echo ""
echo "設定内容:"
echo "  スケジュール: 毎週土曜日 21:00"
echo "  実行コマンド: npm run youtube:sync"
echo "  作業ディレクトリ: /Users/user/toyamablog"
echo ""
echo "現在のcrontab:"
crontab -l | grep youtube:sync
echo ""
echo "次回実行予定:"
echo "  次の土曜日 21:00"
echo ""
echo "ログファイル:"
echo "  /Users/user/toyamablog/logs/youtube-sync-YYYYMMDD-HHMMSS.log"

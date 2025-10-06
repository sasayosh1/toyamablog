#!/bin/bash

# YouTube動画自動同期スクリプト
# 新しい動画を検出してSanityブログ記事を自動作成

set -e

# プロジェクトディレクトリに移動
cd "$(dirname "$0")/.."

# ログファイル設定
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/youtube-sync-$(date +%Y%m%d-%H%M%S).log"

# ログディレクトリ作成
mkdir -p "$LOG_DIR"

# ログ出力関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "YouTube自動同期スクリプト開始"
log "========================================="

# 環境変数の読み込み
if [ -f .env.local ]; then
    log ".env.local を読み込み中..."
    # 環境変数を1行ずつ読み込んで設定
    while IFS='=' read -r key value; do
        # コメント行と空行をスキップ
        if [[ ! $key =~ ^# && -n $key ]]; then
            # クォートを削除して環境変数をエクスポート
            value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            export "$key=$value"
        fi
    done < .env.local
else
    log "エラー: .env.local が見つかりません"
    exit 1
fi

# 必須環境変数のチェック
if [ -z "$YOUTUBE_CHANNEL_ID" ] || [ -z "$YOUTUBE_API_KEY" ] || [ -z "$SANITY_API_TOKEN" ]; then
    log "エラー: 必須環境変数が設定されていません"
    log "YOUTUBE_CHANNEL_ID: ${YOUTUBE_CHANNEL_ID:-(未設定)}"
    log "YOUTUBE_API_KEY: ${YOUTUBE_API_KEY:+(設定済み)}"
    log "SANITY_API_TOKEN: ${SANITY_API_TOKEN:+(設定済み)}"
    exit 1
fi

# 環境変数を明示的にエクスポート（CLAUDE.md インシデント対策）
export SANITY_API_TOKEN
export YOUTUBE_CHANNEL_ID
export YOUTUBE_API_KEY
export GOOGLE_MAPS_API_KEY

log "環境変数チェック完了"
log "チャンネルID: $YOUTUBE_CHANNEL_ID"

# YouTube動画チェック・記事作成スクリプト実行
log "YouTube動画チェック開始..."
node scripts/check-youtube-and-create-articles.cjs 2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    log "========================================="
    log "YouTube自動同期完了"
    log "========================================="
else
    log "========================================="
    log "エラー: YouTube自動同期が失敗しました (終了コード: $EXIT_CODE)"
    log "========================================="
    exit $EXIT_CODE
fi

# 古いログファイルの削除（30日以上前のログを削除）
find "$LOG_DIR" -name "youtube-sync-*.log" -mtime +30 -delete 2>/dev/null || true

log "ログファイル: $LOG_FILE"

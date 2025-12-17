/**
 * 共通ユーティリティ関数
 */

// 見出しテキストからIDを生成する関数
export const generateHeadingId = (text: string, level: string): string => {
  const cleanText = text.trim()
  // 日本語文字を含む文字列に対応したslug生成
  const slug = cleanText
    .toLowerCase()
    .replace(/\s+/g, '-')  // スペースをハイフンに
    .replace(/[^\w\-ぁ-んァ-ヶー一-龠]/g, '')  // 日本語文字と英数字、ハイフンのみ保持
    .replace(/-+/g, '-')  // 連続するハイフンを1つに
    .replace(/^-|-$/g, '')  // 先頭末尾のハイフンを削除
  return `heading-${level}-${slug}`
}

// YouTube URLからビデオIDを抽出する関数
export const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

// テキストをクラス名として安全な形式に変換
export const toSafeClassName = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// 配列が空でないかチェック
export const isNotEmpty = <T>(array: T[] | undefined | null): array is T[] => {
  return Array.isArray(array) && array.length > 0
}

// テキストから読了時間を計算する関数（日本語対応）
export const calculateReadingTime = (text: string): number => {
  // 日本語の場合、1分間に約400-500文字読めるとされる
  const CHARS_PER_MINUTE = 450
  
  // HTMLタグを除去
  const cleanText = text.replace(/<[^>]*>/g, '')
  
  // 文字数をカウント
  const charCount = cleanText.length
  
  // 読了時間を計算（最低1分）
  const readingTime = Math.max(1, Math.ceil(charCount / CHARS_PER_MINUTE))
  
  return readingTime
}

// PortableTextコンテンツから読了時間を計算
export const calculateReadingTimeFromPortableText = (content: Array<{
  _type?: string
  style?: string
  children?: Array<{ text: string }>
  html?: string
}>): number => {
  if (!Array.isArray(content)) return 1
  
  let totalText = ''
  
  const extractText = (blocks: typeof content): void => {
    blocks.forEach((block) => {
      if (block._type === 'block') {
        // テキストブロックから文字を抽出
        if (block.children) {
          block.children.forEach((child) => {
            if (child.text) {
              totalText += child.text + ' '
            }
          })
        }
      } else if (block._type === 'html' && block.html) {
        // HTMLブロックからテキストを抽出
        const htmlText = block.html.replace(/<[^>]*>/g, '')
        totalText += htmlText + ' '
      }
    })
  }
  
  extractText(content)
  return calculateReadingTime(totalText)
}

// YouTube Shorts由来の「#〜 #shorts」等を表示用に除去（本文は破壊しない）
export const stripShortsAndHashtags = (raw: string): string => {
  if (!raw) return raw

  const lines = raw.split('\n')
  const out: string[] = []

  for (const originalLine of lines) {
    const trimmed = originalLine.trim()

    // "# ... #shorts" のような先頭行はタイトルと重複しやすいので丸ごと消す
    if (/^#{1,6}\s+/.test(trimmed) && /[#＃]shorts\b/i.test(trimmed)) {
      continue
    }

    let line = originalLine

    // #shorts を除去
    line = line.replace(/[#＃]shorts\b/gi, '')

    // ハッシュタグ（#富山 / ＃富山 など）を除去（前後が空白のものだけを対象にする）
    line = line.replace(/(^|[\s　])([#＃][^\s　#＃]+)(?=$|[\s　])/g, ' ')

    // 余分なスペースを整形
    line = line.replace(/[\s　]{2,}/g, ' ').trim()

    if (!line) continue
    out.push(line)
  }

  return out.join('\n').trim()
}

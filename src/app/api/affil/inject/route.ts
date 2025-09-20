import { NextRequest, NextResponse } from 'next/server'

interface InjectRequest {
  type: 'mdx' | 'html'
  content: string
}

// アフィリエイトリンク挿入ルール
const AFFIL_RULES = [
  {
    keywords: ['宿泊', 'ホテル', '旅館', '温泉宿'],
    id: 'jtb_hotel',
    priority: 1
  },
  {
    keywords: ['旅行', 'ツアー', '観光旅行'],
    id: 'nippontabi_akafu',
    priority: 2
  },
  {
    keywords: ['富山', '立山', '黒部', '氷見', '高岡'],
    id: 'airtrip_plus_toyama',
    priority: 3
  },
  {
    keywords: ['観光', '口コミ', 'レビュー'],
    id: 'tripadvisor',
    priority: 4
  },
  {
    keywords: ['航空券', '飛行機', 'フライト'],
    id: 'sorahapi_flight',
    priority: 5
  },
  {
    keywords: ['オプショナルツアー', '体験', 'アクティビティ'],
    id: 'veltra_popular',
    priority: 6
  }
]

function analyzeContent(content: string) {
  const matches = []

  for (const rule of AFFIL_RULES) {
    for (const keyword of rule.keywords) {
      if (content.includes(keyword)) {
        matches.push({
          keyword,
          id: rule.id,
          priority: rule.priority,
          count: (content.match(new RegExp(keyword, 'g')) || []).length
        })
      }
    }
  }

  // 優先度とキーワード出現回数で並び替え
  return matches.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return b.count - a.count
  })
}

function injectAffilLinks(content: string, type: 'mdx' | 'html'): string {
  let result = content
  const matches = analyzeContent(content)

  if (matches.length === 0) {
    return result
  }

  // 使用するアフィリエイトIDを決定（最大3つまで）
  const selectedIds = [...new Set(matches.slice(0, 3).map(m => m.id))]

  if (type === 'html') {
    // HTML形式の場合
    result = injectToHtml(result, selectedIds)
  } else {
    // MDX形式の場合
    result = injectToMdx(result, selectedIds)
  }

  // 記事末尾に免責事項を追加（既に存在しない場合のみ）
  if (!result.includes('※本記事にはアフィリエイトリンクを含みます') &&
      !result.includes('[PR]') &&
      !result.includes('アフィリエイトリンク')) {
    const disclaimer = type === 'html'
      ? '<p style="font-size: 12px; color: #666; margin-top: 2rem;">※本記事にはアフィリエイトリンクを含みます</p>'
      : '\n\n*※本記事にはアフィリエイトリンクを含みます*'

    result += disclaimer
  }

  return result
}

function injectToHtml(content: string, ids: string[]): string {
  let result = content
  let insertCount = 0

  // pタグ内でaタグが含まれていない段落を探して挿入
  const pTagRegex = /<p[^>]*>(.*?)<\/p>/gs

  result = result.replace(pTagRegex, (match, innerContent) => {
    // 既にaタグやspanタグが含まれている場合はスキップ
    if (innerContent.includes('<a ') ||
        innerContent.includes('<span ') ||
        innerContent.includes('data-affil') ||
        insertCount >= ids.length) {
      return match
    }

    // 文字数が短すぎる段落はスキップ
    if (innerContent.length < 20) {
      return match
    }

    const id = ids[insertCount]
    insertCount++

    // 段落の最後に挿入
    const injected = innerContent + `<span data-affil="${id}"></span>`
    return match.replace(innerContent, injected)
  })

  return result
}

function injectToMdx(content: string, ids: string[]): string {
  let result = content
  let insertCount = 0

  // 段落を分割して処理
  const paragraphs = result.split(/\n\s*\n/)
  const processedParagraphs = paragraphs.map((paragraph) => {
    // 既にコンポーネントやリンクが含まれている段落はスキップ
    if (paragraph.includes('<') ||
        paragraph.includes('[') ||
        paragraph.includes('data-affil') ||
        paragraph.trim().startsWith('#') ||
        paragraph.trim().startsWith('```') ||
        insertCount >= ids.length) {
      return paragraph
    }

    // 文字数が短すぎる段落はスキップ
    if (paragraph.trim().length < 20) {
      return paragraph
    }

    const id = ids[insertCount]
    insertCount++

    // 段落の最後に挿入
    return paragraph + `\n\n<Affil id="${id}" />`
  })

  return processedParagraphs.join('\n\n')
}

export async function POST(request: NextRequest) {
  try {
    const body: InjectRequest = await request.json()

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!body.type || !['mdx', 'html'].includes(body.type)) {
      return NextResponse.json(
        { ok: false, error: 'Type must be "mdx" or "html"' },
        { status: 400 }
      )
    }

    const result = injectAffilLinks(body.content, body.type)

    return NextResponse.json({
      ok: true,
      result
    })
  } catch (error) {
    console.error('Affiliate injection error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
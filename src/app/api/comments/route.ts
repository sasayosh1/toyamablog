import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// コメントの型定義
interface Comment {
  id: string
  postSlug: string
  author: string
  email?: string
  content: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
}

// 仮のコメントデータ（実際の実装では外部DB使用）
const comments: Comment[] = []

// レート制限のための簡単な実装
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15分
  const maxRequests = 10 // 15分あたり最大10リクエスト
  
  const current = rateLimitMap.get(ip)
  
  if (!current || current.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count < maxRequests) {
    current.count++
    return true
  }
  
  return false
}

// 簡単な入力バリデーション
function validateComment(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const commentData = data as Record<string, unknown>
  
  if (!commentData.postSlug || typeof commentData.postSlug !== 'string' || commentData.postSlug.trim().length === 0) {
    errors.push('記事IDが必要です')
  }
  
  if (!commentData.author || typeof commentData.author !== 'string' || commentData.author.trim().length === 0) {
    errors.push('お名前が必要です')
  } else if (commentData.author.trim().length > 50) {
    errors.push('お名前は50文字以内で入力してください')
  }
  
  if (!commentData.content || typeof commentData.content !== 'string' || commentData.content.trim().length === 0) {
    errors.push('コメント内容が必要です')
  } else if (commentData.content.trim().length > 1000) {
    errors.push('コメントは1000文字以内で入力してください')
  }
  
  if (commentData.email && typeof commentData.email === 'string') {
    if (!isValidEmail(commentData.email)) {
      errors.push('有効なメールアドレスを入力してください')
    }
  }
  
  return { isValid: errors.length === 0, errors }
}

function isValidEmail(email: string): boolean {
  const trimmed = email.trim()
  if (trimmed.length === 0 || trimmed.length > 254) return false
  if (/\s/.test(trimmed)) return false

  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0) return false
  if (trimmed.indexOf('@', atIndex + 1) !== -1) return false

  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)
  if (local.length === 0 || domain.length === 0) return false
  if (domain.startsWith('.') || domain.endsWith('.')) return false
  if (!domain.includes('.')) return false
  if (domain.includes('..')) return false

  return true
}

// スパムフィルター
function isSpam(content: string): boolean {
  const spamKeywords = ['spam', 'advertisement', 'http://', 'https://']
  const lowerContent = content.toLowerCase()
  
  // 簡単なスパムチェック
  for (const keyword of spamKeywords) {
    if (lowerContent.includes(keyword)) {
      return true
    }
  }
  
  // 同じ文字の繰り返しチェック
  const repeatedChars = /(.)\1{10,}/.test(content)
  if (repeatedChars) {
    return true
  }
  
  return false
}

// GET - コメント一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')
    
    if (!postSlug) {
      return NextResponse.json(
        { error: '記事IDが必要です' },
        { status: 400 }
      )
    }
    
    // 承認されたコメントのみ返す
    const approvedComments = comments
      .filter(comment => comment.postSlug === postSlug && comment.status === 'approved')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(({ email: _, ...rest }) => rest) // メールアドレスは公開しない
    
    return NextResponse.json({
      comments: approvedComments,
      total: approvedComments.length
    })
    
  } catch (error) {
    console.error('Comment fetch error:', error)
    return NextResponse.json(
      { error: 'コメントの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST - 新しいコメント投稿
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
              headersList.get('x-real-ip') || 
              '127.0.0.1'
    
    // レート制限チェック
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'リクエストが多すぎます。しばらくしてからお試しください。' },
        { status: 429 }
      )
    }
    
    const data = await request.json()
    
    // バリデーション
    const validation = validateComment(data)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: validation.errors },
        { status: 400 }
      )
    }
    
    const content = data.content.trim()
    
    // スパムチェック
    if (isSpam(content)) {
      return NextResponse.json(
        { error: 'コメントがスパムとして検出されました' },
        { status: 400 }
      )
    }
    
    // 新しいコメント作成
    const newComment: Comment = {
      id: crypto.randomUUID(),
      postSlug: data.postSlug.trim(),
      author: data.author.trim(),
      email: data.email?.trim() || undefined,
      content,
      createdAt: new Date().toISOString(),
      status: 'pending' // デフォルトでは承認待ち
    }
    
    // コメント保存（実際の実装では外部DB使用）
    comments.push(newComment)
    
    // レスポンス（メールアドレスは含めない）
    const { email: _, ...responseComment } = newComment
    
    return NextResponse.json({
      message: 'コメントを投稿しました。管理者の承認後に表示されます。',
      comment: responseComment
    }, { status: 201 })
    
  } catch (error) {
    console.error('Comment post error:', error)
    return NextResponse.json(
      { error: 'コメントの投稿に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT - コメント状態更新（管理者用）
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')
    const adminKey = searchParams.get('adminKey')
    
    // 簡単な管理者認証
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 403 }
      )
    }
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'コメントIDが必要です' },
        { status: 400 }
      )
    }
    
    const data = await request.json()
    const { status } = data
    
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '無効なステータスです' },
        { status: 400 }
      )
    }
    
    const commentIndex = comments.findIndex(c => c.id === commentId)
    if (commentIndex === -1) {
      return NextResponse.json(
        { error: 'コメントが見つかりません' },
        { status: 404 }
      )
    }
    
    comments[commentIndex].status = status
    
    return NextResponse.json({
      message: 'コメントステータスを更新しました',
      comment: comments[commentIndex]
    })
    
  } catch (error) {
    console.error('Comment update error:', error)
    return NextResponse.json(
      { error: 'コメントの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE - コメント削除（管理者用）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')
    const adminKey = searchParams.get('adminKey')
    
    // 簡単な管理者認証
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 403 }
      )
    }
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'コメントIDが必要です' },
        { status: 400 }
      )
    }
    
    const commentIndex = comments.findIndex(c => c.id === commentId)
    if (commentIndex === -1) {
      return NextResponse.json(
        { error: 'コメントが見つかりません' },
        { status: 404 }
      )
    }
    
    const deletedComment = comments.splice(commentIndex, 1)[0]
    
    return NextResponse.json({
      message: 'コメントを削除しました',
      comment: deletedComment
    })
    
  } catch (error) {
    console.error('Comment delete error:', error)
    return NextResponse.json(
      { error: 'コメントの削除に失敗しました' },
      { status: 500 }
    )
  }
}

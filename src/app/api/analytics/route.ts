import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// 分析データの型定義
interface AnalyticsEvent {
  id: string
  type: 'page_view' | 'search' | 'click' | 'error'
  url: string
  userAgent?: string
  referrer?: string
  timestamp: string
  sessionId?: string
  metadata?: Record<string, unknown>
}

// 簡単なメモリ内ストレージ（実際の実装では外部DB使用）
let analyticsData: AnalyticsEvent[] = []

// レート制限
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 1 * 60 * 1000 // 1分
  const maxRequests = 100 // 1分あたり最大100リクエスト
  
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

// 個人情報を含まない形でIPアドレスをハッシュ化
function hashIP(ip: string): string {
  // 簡単なハッシュ（実際の実装ではより安全な方法を使用）
  const segments = ip.split('.')
  if (segments.length === 4) {
    // IPv4の場合、最後のオクテットをマスク
    return `${segments[0]}.${segments[1]}.${segments[2]}.xxx`
  }
  return 'masked'
}

// POST - 分析イベントの記録
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || ''
    const ip = headersList.get('x-forwarded-for') || 
              headersList.get('x-real-ip') || 
              '127.0.0.1'
    
    // レート制限チェック
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    const data = await request.json()
    const { type, url, sessionId, metadata } = data
    
    // バリデーション
    if (!type || !['page_view', 'search', 'click', 'error'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }
    
    // 新しい分析イベントを作成
    const analyticsEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type,
      url,
      userAgent: userAgent.substring(0, 200), // 最大200文字
      referrer: referrer.substring(0, 200),
      timestamp: new Date().toISOString(),
      sessionId: sessionId?.substring(0, 50),
      metadata: metadata ? {
        ...metadata,
        hashedIP: hashIP(ip)
      } : { hashedIP: hashIP(ip) }
    }
    
    // イベントを保存（実際の実装では外部DB使用）
    analyticsData.push(analyticsEvent)
    
    // 古いデータのクリーンアップ（メモリ使用量制御）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    analyticsData = analyticsData.filter(event => event.timestamp > thirtyDaysAgo)
    
    // ログ出力（開発用）
    if (process.env.NODE_ENV === 'development') {
      console.log(`Analytics event recorded:`, {
        type: analyticsEvent.type,
        url: analyticsEvent.url,
        timestamp: analyticsEvent.timestamp
      })
    }
    
    return NextResponse.json({
      success: true,
      eventId: analyticsEvent.id
    })
    
  } catch (error) {
    console.error('Analytics POST error:', error)
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    )
  }
}

// GET - 分析データの取得（管理者用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('adminKey')
    const type = searchParams.get('type')
    const days = parseInt(searchParams.get('days') || '7', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 1000)
    
    // 簡単な管理者認証
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    
    // フィルタリング
    let filteredData = analyticsData.filter(event => event.timestamp > fromDate)
    
    if (type) {
      filteredData = filteredData.filter(event => event.type === type)
    }
    
    // 制限適用
    filteredData = filteredData
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
    
    // 統計情報の生成
    const stats = {
      totalEvents: filteredData.length,
      eventTypes: {} as Record<string, number>,
      topPages: {} as Record<string, number>,
      topReferrers: {} as Record<string, number>
    }
    
    filteredData.forEach(event => {
      // イベントタイプ別カウント
      stats.eventTypes[event.type] = (stats.eventTypes[event.type] || 0) + 1
      
      // ページ別カウント
      stats.topPages[event.url] = (stats.topPages[event.url] || 0) + 1
      
      // リファラー別カウント
      if (event.referrer) {
        stats.topReferrers[event.referrer] = (stats.topReferrers[event.referrer] || 0) + 1
      }
    })
    
    // トップ10を取得
    const sortByValue = (obj: Record<string, number>) => 
      Object.entries(obj).sort(([,a], [,b]) => b - a).slice(0, 10)
    
    return NextResponse.json({
      events: filteredData,
      stats: {
        ...stats,
        topPages: sortByValue(stats.topPages),
        topReferrers: sortByValue(stats.topReferrers)
      },
      period: {
        days,
        from: fromDate,
        to: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Analytics GET error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}

// DELETE - 分析データの削除（管理者用）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('adminKey')
    const days = parseInt(searchParams.get('days') || '30', 10)
    
    // 簡単な管理者認証
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const initialCount = analyticsData.length
    
    // 指定した日数より古いデータを削除
    analyticsData = analyticsData.filter(event => event.timestamp > cutoffDate)
    
    const deletedCount = initialCount - analyticsData.length
    
    return NextResponse.json({
      success: true,
      deletedCount,
      remainingCount: analyticsData.length,
      cutoffDate
    })
    
  } catch (error) {
    console.error('Analytics DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete analytics data' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/sanity'
import { headers } from 'next/headers'

// レート制限のための簡単な実装
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 1 * 60 * 1000 // 1分
  const maxRequests = 30 // 1分あたり最大30リクエスト
  
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

// 検索クエリのサニタイズ
function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\w\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/g, '') // 日本語と英数字のみ許可
    .trim()
    .slice(0, 100) // 最大100文字
}

export async function GET(request: NextRequest) {
  try {
    console.log('Search API called')
    
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 
              headersList.get('x-real-ip') || 
              '127.0.0.1'
    
    // レート制限チェック
    if (!checkRateLimit(ip)) {
      console.log(`Rate limit exceeded for IP: ${ip}`)
      return NextResponse.json(
        { 
          error: 'リクエストが多すぎます。しばらくしてからお試しください。',
          posts: [],
          total: 0 
        },
        { status: 429 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const rawQuery = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)
    
    console.log(`Search query: "${rawQuery}", category: ${category}, page: ${page}, limit: ${limit}`)

    if (!rawQuery.trim() || rawQuery.trim().length < 1) {
      console.log('Empty or too short query, returning empty results')
      return NextResponse.json({ 
        posts: [], 
        total: 0,
        page,
        hasMore: false,
        query: rawQuery 
      })
    }

    // クエリをサニタイズ
    const sanitizedQuery = sanitizeSearchQuery(rawQuery)
    
    if (sanitizedQuery.length === 0) {
      console.log('Query became empty after sanitization')
      return NextResponse.json({ 
        posts: [], 
        total: 0,
        page,
        hasMore: false,
        query: rawQuery,
        error: '有効な検索キーワードを入力してください'
      })
    }

    console.log('Calling searchPosts with sanitized query...')
    const allPosts = await searchPosts(sanitizedQuery)
    console.log(`searchPosts returned ${allPosts.length} results`)
    
    // カテゴリフィルタリング
    const filteredPosts = category 
      ? allPosts.filter(post => post.category === category)
      : allPosts
    
    // ページネーション
    const startIndex = (page - 1) * limit
    const posts = filteredPosts.slice(startIndex, startIndex + limit)
    
    // ページネーション情報
    const hasMore = posts.length === limit
    
    // 結果の後処理（サムネイル URL 生成など）
    const processedPosts = posts.map((post) => ({
      ...post,
      thumbnailUrl: post.youtubeUrl 
        ? (() => {
            let videoId = null
            if (post.youtubeUrl.includes('youtu.be/')) {
              videoId = post.youtubeUrl.split('youtu.be/')[1]?.split('?')[0]
            } else if (post.youtubeUrl.includes('youtube.com/watch?v=')) {
              videoId = post.youtubeUrl.split('v=')[1]?.split('&')[0]
            } else if (post.youtubeUrl.includes('youtube.com/shorts/')) {
              videoId = post.youtubeUrl.split('shorts/')[1]?.split('?')[0]
            }
            return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
          })()
        : post.thumbnail?.asset?.url || null
    }))
    
    return NextResponse.json({ 
      posts: processedPosts,
      total: posts.length,
      page,
      limit,
      hasMore,
      query: sanitizedQuery,
      originalQuery: rawQuery,
      searchTime: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        error: '検索処理中にエラーが発生しました',
        posts: [],
        total: 0,
        page: 1,
        hasMore: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // セキュリティチェック
    const authHeader = request.headers.get('authorization')
    const secret = process.env.REVALIDATE_SECRET
    
    if (!secret) {
      return NextResponse.json(
        { error: 'REVALIDATE_SECRET not configured' },
        { status: 500 }
      )
    }

    // Authorization: Bearer <secret> or ?secret=<secret>
    const providedSecret = authHeader?.replace('Bearer ', '') || 
                          request.nextUrl.searchParams.get('secret')
    
    if (providedSecret !== secret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, slug, tags, paths } = body

    console.log(`[Revalidate] Request: ${JSON.stringify(body)}`)

    // タグベースの再検証
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        revalidateTag(tag)
        console.log(`[Revalidate] Tag: ${tag}`)
      }
    }

    // パスベースの再検証
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path)
        console.log(`[Revalidate] Path: ${path}`)
      }
    }

    // Sanity Webhookからの自動判定
    if (type === 'post') {
      // 投稿関連の全タグを再検証
      revalidateTag('posts')
      
      if (slug) {
        revalidateTag(`post-${slug}`)
        revalidatePath(`/blog/${slug}`)
        console.log(`[Revalidate] Post: ${slug}`)
      }
      
      // ホームページも再検証（新着記事表示）
      revalidatePath('/')
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      tags: tags || (type === 'post' ? ['posts', slug && `post-${slug}`].filter(Boolean) : []),
      paths: paths || (type === 'post' && slug ? ['/', `/blog/${slug}`] : ['/'])
    })

  } catch (error) {
    console.error('[Revalidate] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method for manual testing
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const tag = request.nextUrl.searchParams.get('tag')
  const path = request.nextUrl.searchParams.get('path')
  
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (tag) {
    revalidateTag(tag)
    console.log(`[Revalidate] Manual tag: ${tag}`)
  }
  
  if (path) {
    revalidatePath(path)
    console.log(`[Revalidate] Manual path: ${path}`)
  }

  return NextResponse.json({
    revalidated: true,
    tag,
    path,
    timestamp: new Date().toISOString()
  })
}
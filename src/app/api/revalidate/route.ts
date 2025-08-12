import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // セキュリティチェック
    const secret = process.env.REVALIDATE_SECRET
    
    if (!secret) {
      return NextResponse.json(
        { error: 'REVALIDATE_SECRET not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { secret: providedSecret, type, slug } = body

    // 受信JSON: { secret, type: 'list' | 'detail', slug? }
    if (providedSecret !== secret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    console.log(`[Revalidate] Request: ${JSON.stringify({ type, slug })}`)

    const revalidatedTags: string[] = []
    const revalidatedPaths: string[] = []

    // type==='list' -> revalidateTag('post-list')
    if (type === 'list') {
      revalidateTag('post-list')
      revalidatedTags.push('post-list')
      revalidatePath('/')
      revalidatedPaths.push('/')
      console.log(`[Revalidate] List updated`)
    }

    // type==='detail' && slug -> revalidatePath(`/blog/${slug}`)
    if (type === 'detail' && slug) {
      const shortSlug = slug.substring(0, 50)
      revalidateTag(`post-detail-${shortSlug}`)
      revalidatePath(`/blog/${slug}`)
      revalidatedTags.push(`post-detail-${shortSlug}`)
      revalidatedPaths.push(`/blog/${slug}`)
      console.log(`[Revalidate] Detail updated: ${slug}`)
    }

    // 従来のpost typeサポート（後方互換性）
    if (type === 'post') {
      revalidateTag('post-list')
      revalidatedTags.push('post-list')
      revalidatePath('/')
      revalidatedPaths.push('/')
      
      if (slug) {
        const shortSlug = slug.substring(0, 50)
        revalidateTag(`post-detail-${shortSlug}`)
        revalidatePath(`/blog/${slug}`)
        revalidatedTags.push(`post-detail-${shortSlug}`)
        revalidatedPaths.push(`/blog/${slug}`)
      }
      
      console.log(`[Revalidate] Post updated (legacy): ${slug || 'all'}`)
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
      type,
      slug,
      tags: revalidatedTags,
      paths: revalidatedPaths
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
  const type = request.nextUrl.searchParams.get('type') // 'list' | 'detail'
  const slug = request.nextUrl.searchParams.get('slug')
  
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const revalidatedTags: string[] = []
  const revalidatedPaths: string[] = []

  if (type === 'list') {
    revalidateTag('post-list')
    revalidatePath('/')
    revalidatedTags.push('post-list')
    revalidatedPaths.push('/')
    console.log(`[Revalidate] Manual list update`)
  }
  
  if (type === 'detail' && slug) {
    const shortSlug = slug.substring(0, 50)
    revalidateTag(`post-detail-${shortSlug}`)
    revalidatePath(`/blog/${slug}`)
    revalidatedTags.push(`post-detail-${shortSlug}`)
    revalidatedPaths.push(`/blog/${slug}`)
    console.log(`[Revalidate] Manual detail update: ${slug}`)
  }

  return NextResponse.json({
    revalidated: true,
    type,
    slug,
    tags: revalidatedTags,
    paths: revalidatedPaths,
    timestamp: new Date().toISOString()
  })
}
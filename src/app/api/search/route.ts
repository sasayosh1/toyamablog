import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/sanity'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim()) {
      return NextResponse.json({ posts: [] })
    }

    const posts = await searchPosts(query)
    
    return NextResponse.json({ 
      posts,
      total: posts.length 
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search posts' },
      { status: 500 }
    )
  }
}
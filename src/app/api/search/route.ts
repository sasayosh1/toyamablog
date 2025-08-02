import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/sanity'

export async function GET(request: NextRequest) {
  try {
    console.log('Search API called');
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    console.log(`Search query: "${query}"`);

    if (!query.trim()) {
      console.log('Empty query, returning empty results');
      return NextResponse.json({ posts: [], total: 0 })
    }

    console.log('Calling searchPosts...');
    const posts = await searchPosts(query)
    console.log(`searchPosts returned ${posts.length} results`);
    
    return NextResponse.json({ 
      posts,
      total: posts.length,
      query 
    })
    
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to search posts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  
  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 })
  }

  // プレビューモードを有効にして記事ページにリダイレクト
  redirect(`/blog/${slug}?preview=true`)
}
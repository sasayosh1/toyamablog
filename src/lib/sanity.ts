import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
})

export interface Post {
  _id: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  body: unknown[]
  categories?: string[]
  youtubeId?: string
  excerpt?: string
}

export async function getAllPosts(): Promise<Post[]> {
  const query = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    body,
    categories,
    "youtubeId": body[0].children[0].text
  }`
  
  return client.fetch(query)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    body,
    categories,
    "youtubeId": body[0].children[0].text
  }`
  
  return client.fetch(query, { slug })
}
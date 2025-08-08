import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // 即時反映のため無効化
  perspective: 'published', // publishedコンテンツのみ
  token: process.env.SANITY_API_TOKEN, // サーバーサイドトークン追加
});

export interface Author {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  bio?: string;
  image?: {
    asset: {
      _ref: string;
      url: string;
    };
  };
}

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  tags?: string[];
  category?: string;
  categories?: string[];
  publishedAt: string;
  body?: unknown;
  youtubeUrl?: string;
  author?: Author;
  excerpt?: string;
  displayExcerpt?: string;
}

export type BlogPost = Post;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      excerpt,
      tags,
      category,
      publishedAt,
      youtubeUrl,
      author->{
        _id,
        name,
        slug,
        bio,
        image{
          asset->{
            _ref,
            url
          }
        }
      },
      "categories": [category],
      "displayExcerpt": coalesce(excerpt, description)
    }
  `, {}, { 
    next: { 
      tags: ['posts'], 
      revalidate: 300 // 5分
    } 
  });
  
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      tags,
      category,
      publishedAt,
      body,
      youtubeUrl,
      author->{
        _id,
        name,
        slug,
        bio,
        image{
          asset->{
            _ref,
            url
          }
        }
      }
    }
  `, { slug }, { 
    next: { 
      tags: ['posts', `post-${slug.substring(0, 50)}`], // タグ長制限対応
      revalidate: 60 // 1分
    } 
  });
  
  return post;
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const categories = await client.fetch<{category: string}[]>(`
      *[_type == "post" && defined(category)] {
        category
      } | order(category asc)
    `);
    
    // ユニークなカテゴリーのみを抽出
    const uniqueCategories = [...new Set(categories.map(item => item.category))];
    return uniqueCategories.filter(Boolean);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return [];
  }
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  if (!searchTerm.trim()) return [];
  
  try {
    // より安全で効果的な検索クエリ
    const posts = await client.fetch<Post[]>(`
      *[_type == "post" && (
        title match "*" + $searchTerm + "*" ||
        description match "*" + $searchTerm + "*" ||
        category match "*" + $searchTerm + "*" ||
        pt::text(body) match "*" + $searchTerm + "*"
      )] | order(publishedAt desc) [0...20] {
        _id,
        title,
        slug,
        description,
        tags,
        category,
        publishedAt,
        youtubeUrl,
        author->{
          _id,
          name,
          slug,
          bio,
          image{
            asset->{
              _ref,
              url
            }
          }
        },
        excerpt,
        "categories": [category],
        "displayExcerpt": coalesce(excerpt, description)
      }
    `, { searchTerm });
    
    console.log(`Search for "${searchTerm}" returned ${posts.length} results`);
    return posts;
    
  } catch (error) {
    console.error('Search error:', error);
    
    // フォールバック: シンプルな検索
    try {
      const fallbackPosts = await client.fetch<Post[]>(`
        *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...20] {
          _id,
          title,
          slug,
          description,
          tags,
          category,
          publishedAt,
          youtubeUrl,
          author->{
            _id,
            name,
            slug,
            bio,
            image{
              asset->{
                _ref,
                url
              }
            }
          },
          excerpt,
          "categories": [category],
          "displayExcerpt": coalesce(excerpt, description)
        }
      `);
      
      // クライアントサイドフィルタリング
      const filtered = fallbackPosts.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log(`Fallback search for "${searchTerm}" returned ${filtered.length} results`);
      return filtered;
      
    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError);
      return [];
    }
  }
}
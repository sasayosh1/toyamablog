import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // CDN有効化でパフォーマンス向上
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
  thumbnail?: {
    asset: {
      _ref: string;
      url: string;
    };
    alt?: string;
  };
}

export type BlogPost = Post;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await client.fetch(`
    *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      excerpt,
      category,
      publishedAt,
      youtubeUrl,
      thumbnail {
        asset -> {
          _ref,
          url
        },
        alt
      },
      "categories": [category],
      "displayExcerpt": coalesce(excerpt, description)
    }
  `, {}, { 
    next: { 
      tags: ['post-list'], 
      revalidate: 300 // 5分キャッシュ
    } 
  });
  
  return posts;
}

export async function getPostsPaginated(page: number = 1, limit: number = 50): Promise<{
  posts: Post[]
  totalPosts: number
  totalPages: number
  currentPage: number
}> {
  const offset = (page - 1) * limit

  const [posts, totalPosts] = await Promise.all([
    client.fetch(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        excerpt,
        category,
        publishedAt,
        youtubeUrl,
        thumbnail {
          asset -> {
            _ref,
            url
          },
          alt
        },
        "categories": [category],
        "displayExcerpt": coalesce(excerpt, description)
      }
    `, {}, { 
      next: { 
        tags: ['post-list-paginated'], 
        revalidate: 300 
      } 
    }),
    client.fetch(`count(*[_type == "post" && defined(publishedAt)])`, {}, {
      next: { 
        tags: ['post-count'], 
        revalidate: 300 
      } 
    })
  ])
  
  return {
    posts,
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page
  }
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
      youtubeUrl
    }
  `, { slug }, { 
    next: { 
      tags: ['post-detail', `post-detail-${slug}`], 
      revalidate: 600 // 10分キャッシュ
    } 
  });
  
  return post;
}

export async function getAllCategories(): Promise<string[]> {
  try {
    const categories = await client.fetch<{category: string}[]>(`
      array::unique(*[_type == "post" && defined(category)].category) | order(@)
    `, {}, { 
      next: { 
        tags: ['categories'], 
        revalidate: 3600 // 1時間キャッシュ
      } 
    });
    
    return categories.filter(Boolean);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return [];
  }
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  if (!searchTerm.trim()) return [];
  
  console.log(`Starting search for: "${searchTerm}"`);
  
  try {
    // シンプルで高速な検索クエリ
    const posts = await client.fetch<Post[]>(`
      *[_type == "post" && (
        title match "*" + $searchTerm + "*" ||
        description match "*" + $searchTerm + "*" ||
        category match "*" + $searchTerm + "*"
      )] | order(publishedAt desc) [0...20] {
        _id,
        title,
        slug,
        description,
        tags,
        category,
        publishedAt,
        youtubeUrl,
        thumbnail{
          asset->{
            _ref,
            url
          },
          alt
        },
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
    `, { searchTerm }, { 
      // キャッシュを無効にして即座に結果を取得
      next: { revalidate: 0 },
      cache: 'no-store'
    });
    
    console.log(`Direct search for "${searchTerm}" returned ${posts.length} results`);
    return posts;
    
  } catch (error) {
    console.error('Direct search error:', error);
    
    // フォールバック: 全件取得してクライアントサイドフィルタリング
    try {
      console.log('Attempting fallback search...');
      const fallbackPosts = await client.fetch<Post[]>(`
        *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [0...50] {
          _id,
          title,
          slug,
          description,
          tags,
          category,
          publishedAt,
          youtubeUrl,
          thumbnail{
            asset->{
              _ref,
              url
            },
            alt
          },
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
      `, {}, { 
        next: { revalidate: 0 },
        cache: 'no-store'
      });
      
      console.log(`Fetched ${fallbackPosts.length} posts for client-side filtering`);
      
      // クライアントサイドフィルタリング
      const filtered = fallbackPosts.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      console.log(`Fallback search for "${searchTerm}" returned ${filtered.length} results`);
      return filtered;
      
    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError);
      return [];
    }
  }
}
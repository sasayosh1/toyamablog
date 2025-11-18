import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // CDN有効化でパフォーマンス向上
  perspective: 'published', // publishedコンテンツのみ
  token: process.env.SANITY_API_TOKEN, // サーバーサイドトークン追加
  stega: false, // Stegaを無効化してパフォーマンス向上
  requestTagPrefix: 'toyama-osukidesuka', // キャッシュタグ最適化
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

type CategoryCarrier = {
  category?: string | null;
  categories?: (string | null)[] | null;
  categoryRefs?: (string | null)[] | null;
};

function collectCategories(source?: (string | null)[]) {
  const values: string[] = [];
  source?.forEach((value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) {
        values.push(trimmed);
      }
    }
  });
  return values;
}

export function normalizePostCategories<T extends CategoryCarrier>(
  doc: T
): Omit<T, 'categoryRefs'> & { categories?: string[]; category?: string } {
  const { categoryRefs, ...rest } = doc;
  const combined = new Set<string>();
  collectCategories(rest.categories || undefined).forEach((value) => combined.add(value));
  collectCategories(categoryRefs || undefined).forEach((value) => combined.add(value));

  if (typeof rest.category === 'string') {
    const trimmed = rest.category.trim();
    if (trimmed) {
      combined.add(trimmed);
    }
  }

  const categories = Array.from(combined);
  const primaryCategory =
    (typeof rest.category === 'string' && rest.category.trim()) || categories[0];

  return {
    ...rest,
    category: primaryCategory || undefined,
    categories: categories.length ? categories : undefined,
  };
}

export function normalizePostCategoryList<T extends CategoryCarrier>(
  docs: T[]
): (Omit<T, 'categoryRefs'> & { categories?: string[]; category?: string })[] {
  return docs.map((doc) => normalizePostCategories(doc));
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = await client.fetch<(Post & CategoryCarrier)[]>(`
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
      "categoryRefs": categories[]->title,
      "displayExcerpt": coalesce(excerpt, description)
    }
  `, {}, { 
    next: { 
      tags: ['post-list'], 
      revalidate: 300 // 5分キャッシュ
    } 
  });
  
  return normalizePostCategoryList(posts);
}

export async function getPostsPaginated(page: number = 1, limit: number = 51): Promise<{
  posts: Post[]
  totalPosts: number
  totalPages: number
  currentPage: number
}> {
  const offset = (page - 1) * limit

  const [posts, totalPosts] = await Promise.all([
    client.fetch<(Post & CategoryCarrier)[]>(`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) [${offset}...${offset + limit}] {
        _id,
        title,
        slug,
        description,
        excerpt,
        category,
        publishedAt,
        youtubeUrl,
        youtubeVideo,
        thumbnail {
          asset -> {
            _ref,
            url
          },
          alt
        },
        "categoryRefs": categories[]->title,
        "displayExcerpt": coalesce(excerpt, description)
      }
    `, {}, {
      next: {
        tags: ['post-list-paginated'],
        revalidate: 600
      }
    }),
    client.fetch(`count(*[_type == "post" && defined(publishedAt)])`, {}, {
      next: {
        tags: ['post-count'],
        revalidate: 3600
      }
    })
  ])

  return {
    posts: normalizePostCategoryList(posts),
    totalPosts,
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  const post = await client.fetch<(Post & CategoryCarrier) | null>(`
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
      "categoryRefs": categories[]->title,
      thumbnail {
        asset -> {
          _ref,
          _id,
          url,
          originalFilename,
          size,
          mimeType,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt
      },
      excerpt,
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
      tags: ['post-detail', `post-detail-${slug}`], 
      revalidate: 600 // 10分キャッシュ
    } 
  });
  
  return post ? normalizePostCategories(post) : null;
}

export async function getAllCategories(options?: { forceFresh?: boolean }): Promise<string[]> {
  try {
    const fetchOptions = options?.forceFresh
      ? { next: { revalidate: 0 }, cache: 'no-store' as const }
      : { next: { tags: ['categories'], revalidate: 300 } };

    const categoryDocs = await client.fetch<CategoryCarrier[]>(`
      *[_type == "post" && defined(publishedAt)]{
        category,
        "categoryRefs": categories[]->title
      }
    `, {}, fetchOptions);

    const normalized = normalizePostCategoryList(categoryDocs);
    const set = new Set<string>();
    normalized.forEach((doc) => {
      doc.categories?.forEach((value) => {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed) {
            set.add(trimmed);
          }
        }
      });
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
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
    const posts = await client.fetch<(Post & CategoryCarrier)[]>(`
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
        "categoryRefs": categories[]->title,
        "displayExcerpt": coalesce(excerpt, description)
      }
    `, { searchTerm }, { 
      // キャッシュを無効にして即座に結果を取得
      next: { revalidate: 0 },
      cache: 'no-store'
    });
    
    console.log(`Direct search for "${searchTerm}" returned ${posts.length} results`);
    return normalizePostCategoryList(posts);
    
  } catch (error) {
    console.error('Direct search error:', error);
    
    // フォールバック: 全件取得してクライアントサイドフィルタリング
    try {
      console.log('Attempting fallback search...');
      const fallbackPosts = await client.fetch<(Post & CategoryCarrier)[]>(`
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
        "categoryRefs": categories[]->title,
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
      return normalizePostCategoryList(filtered);
      
    } catch (fallbackError) {
      console.error('Fallback search error:', fallbackError);
      return [];
    }
  }
}

// 関連記事を取得（同じカテゴリの記事を優先）
export async function getRelatedPosts(currentPostId: string, category?: string, limit: number = 6): Promise<Post[]> {
  try {
    const posts = await client.fetch<(Post & CategoryCarrier)[]>(`
      *[_type == "post" && _id != $currentPostId && defined(publishedAt)] | order(publishedAt desc) [0...${limit * 2}] {
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
        "categoryRefs": categories[]->title,
        "displayExcerpt": coalesce(excerpt, description)
      }
    `, { currentPostId }, {
      next: {
        tags: ['related-posts', `related-posts-${currentPostId}`],
        revalidate: 600 // 10分キャッシュ
      }
    });

    // カテゴリが指定されている場合は、同じカテゴリの記事を優先
    const normalized = normalizePostCategoryList(posts);

    if (category) {
      const sameCategoryPosts = normalized.filter(p => p.category === category);
      const otherPosts = normalized.filter(p => p.category !== category);

      // 同じカテゴリの記事を優先して返す
      return [...sameCategoryPosts, ...otherPosts].slice(0, limit);
    }

    return normalized.slice(0, limit);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// 分析用: 全記事の詳細データを取得（body含む）
export async function getAllPostsForAnalysis(): Promise<Post[]> {
  try {
    const posts = await client.fetch<(Post & CategoryCarrier & { bodyLength: number; bodyPlainText: string })[]>(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        description,
        tags,
        category,
        publishedAt,
        body,
        youtubeUrl,
        excerpt,
        thumbnail {
          asset -> {
            _ref,
            url
          },
          alt
        },
        author->{
          _id,
          name,
          slug,
          bio
        },
        "categoryRefs": categories[]->title,
        "displayExcerpt": coalesce(excerpt, description),
        "bodyLength": length(body),
        "bodyPlainText": array::join(body[_type == "block"].children[_type == "span"].text, " ")
      }
    `, {}, {
      cache: 'no-store'
    });

    return normalizePostCategoryList(posts);
  } catch (error) {
    console.error('Error fetching posts for analysis:', error);
    return [];
  }
}

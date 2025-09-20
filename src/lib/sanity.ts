import { createClient } from '@sanity/client';
import { homePageQuery, type HomePage } from '@/sanity/queries/home';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // CDNを使用してパブリックデータにアクセス
  perspective: 'published', // publishedコンテンツのみ
  // token: process.env.SANITY_API_TOKEN, // コメントアウト：パブリックアクセスを使用
  stega: false, // Stegaを無効化してパフォーマンス向上
  requestTagPrefix: 'toyama-blog', // キャッシュタグ最適化
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

export async function getHomePageContent(): Promise<HomePage> {
  const fallback: HomePage = {
    title: "富山のくせに",
    subtitle: "AMAZING TOYAMA",
    ctaLabel: null,
    ctaHref: null,
    footerText: "富山県の観光・グルメ・文化をお届けします",
  };

  try {
    const data = await client.fetch<HomePage | null>(
      homePageQuery,
      {},
      {
        next: {
          tags: ['home-page'],
          revalidate: 300,
        },
      }
    );

    if (!data) {
      return fallback;
    }

    return {
      title: data.title ?? fallback.title,
      subtitle: data.subtitle ?? fallback.subtitle,
      ctaLabel: data.ctaLabel ?? fallback.ctaLabel,
      ctaHref: data.ctaHref ?? fallback.ctaHref,
      footerText: data.footerText ?? fallback.footerText,
    };
  } catch (error) {
    console.warn('Sanity connection issue, using fallback data:', error);
    return fallback;
  }
}


export async function getAllPosts(): Promise<Post[]> {
  try {
    console.log('🚀 Starting Sanity posts fetch...');
    console.log('🔑 Token length:', process.env.SANITY_API_TOKEN?.length || 'UNDEFINED');
    console.log('🏗️ Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log('🗄️ Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);

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
      cache: 'no-store'
    });

    console.log(`📊 Sanity posts result: ${posts?.length || 0} posts found`);

    if (posts && posts.length > 0) {
      console.log('✅ SUCCESS: Returning actual Sanity posts');
      return posts;
    } else {
      console.warn('⚠️ ZERO POSTS: No posts returned from Sanity');

      // 認証問題の可能性をチェック
      if (!process.env.SANITY_API_TOKEN) {
        console.error('🚫 CRITICAL: SANITY_API_TOKEN is undefined');
      }

      // フォールバックを使用せず、空配列を返す
      console.log('🔄 Returning empty array - NOT using fallback');
      return [];
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR in Sanity posts fetch:', error);

    // 認証エラーの詳細ログ
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.error('🔐 AUTHENTICATION ERROR detected');
      console.error('🔑 Current token:', process.env.SANITY_API_TOKEN ? 'EXISTS' : 'MISSING');
    }

    // フォールバックを使用せず、空配列を返す
    console.log('🔄 Error occurred - returning empty array');
    return [];
  }
}

function getFallbackPosts(): Post[] {
  return [
    {
      _id: 'fallback-1',
      title: '【富山市】富山駅前の隠れ家ケーキ店で至福のひととき',
      slug: { current: 'fallback-cake-shop' },
      description: '富山市にある隠れ家的なケーキ店「シャルロッテ」は、富山駅から徒歩わずか5分の場所にありながら、都会の喧騒を忘れさせてくれる落ち着いた空間です。',
      excerpt: '富山駅から徒歩5分の隠れ家ケーキ店「シャルロッテ」で至福のティータイムを。',
      category: '富山市',
      publishedAt: '2025-01-15T10:00:00Z',
      displayExcerpt: '富山駅から徒歩5分の隠れ家ケーキ店「シャルロッテ」で至福のティータイムを。',
      categories: ['富山市']
    },
    {
      _id: 'fallback-2',
      title: '【高岡市】瑞龍寺の美しい建築と歴史を堪能',
      slug: { current: 'fallback-zuiryuji' },
      description: '国宝瑞龍寺は加賀前田家2代当主前田利長の菩提寺として建立された曹洞宗の寺院です。',
      excerpt: '国宝瑞龍寺で加賀前田家の歴史と美しい建築を堪能しませんか。',
      category: '高岡市',
      publishedAt: '2025-01-14T10:00:00Z',
      displayExcerpt: '国宝瑞龍寺で加賀前田家の歴史と美しい建築を堪能しませんか。',
      categories: ['高岡市']
    },
    {
      _id: 'fallback-3',
      title: '【氷見市】氷見の海の幸と温泉を満喫',
      slug: { current: 'fallback-himi' },
      description: '氷見市は新鮮な海の幸と美しい海岸線で知られる富山県の観光地です。',
      excerpt: '氷見の新鮮な海の幸と温泉で心も体もリフレッシュしませんか。',
      category: '氷見市',
      publishedAt: '2025-01-13T10:00:00Z',
      displayExcerpt: '氷見の新鮮な海の幸と温泉で心も体もリフレッシュしませんか。',
      categories: ['氷見市']
    },
    {
      _id: 'fallback-4',
      title: '【砺波市】チューリップの絶景スポット',
      slug: { current: 'fallback-tonami' },
      description: '砺波市は日本一のチューリップの産地として有名で、春には美しい花畑が広がります。',
      excerpt: '砺波のチューリップ畑で春の絶景を楽しみませんか。',
      category: '砺波市',
      publishedAt: '2025-01-12T10:00:00Z',
      displayExcerpt: '砺波のチューリップ畑で春の絶景を楽しみませんか。',
      categories: ['砺波市']
    },
    {
      _id: 'fallback-5',
      title: '【南砺市】五箇山の合掌造り集落を訪ねて',
      slug: { current: 'fallback-nanto' },
      description: '南砺市の五箇山は世界遺産に登録された美しい合掌造り集落があります。',
      excerpt: '世界遺産の五箇山で日本の伝統文化を体験しませんか。',
      category: '南砺市',
      publishedAt: '2025-01-11T10:00:00Z',
      displayExcerpt: '世界遺産の五箇山で日本の伝統文化を体験しませんか。',
      categories: ['南砺市']
    }
  ];
}

export async function getPostsPaginated(page: number = 1, limit: number = 51): Promise<{
  posts: Post[]
  totalPosts: number
  totalPages: number
  currentPage: number
}> {
  const offset = (page - 1) * limit

  try {
    console.log(`🔄 Paginated fetch: page ${page}, limit ${limit}, offset ${offset}`);

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
        cache: 'no-store'
      }),
      client.fetch(`count(*[_type == "post" && defined(publishedAt)])`, {}, {
        cache: 'no-store'
      })
    ])

    console.log(`📊 Paginated result: ${posts?.length || 0} posts, total: ${totalPosts}`);

    if (posts && totalPosts > 0) {
      console.log('✅ SUCCESS: Returning paginated Sanity posts');
      return {
        posts,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page
      }
    } else {
      console.warn('⚠️ ZERO POSTS: No posts found in pagination');
      return {
        posts: [],
        totalPosts: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  } catch (error) {
    console.error('❌ CRITICAL ERROR in paginated posts fetch:', error);
    return {
      posts: [],
      totalPosts: 0,
      totalPages: 0,
      currentPage: page
    }
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
      youtubeUrl,
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
  
  return post;
}

export async function getAllCategories(): Promise<string[]> {
  try {
    console.log('Fetching categories from Sanity...');
    const categories = await client.fetch<string[]>(`
      array::unique(*[_type == "post" && defined(category)].category) | order(@)
    `, {}, {
      cache: 'no-store' // キャッシュを完全に無効化
    });

    console.log(`Categories fetch result: ${categories?.length || 0} categories`);

    return categories && categories.length > 0 ? categories.filter(Boolean) : getFallbackCategories();
  } catch (error) {
    console.error('Categories fetch error:', error);
    console.log('Using fallback categories due to error');
    return getFallbackCategories();
  }
}

function getFallbackCategories(): string[] {
  return ['富山市', '高岡市', '氷見市', '砺波市', '南砺市'];
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

// 分析用: 全記事の詳細データを取得（body含む）
export async function getAllPostsForAnalysis(): Promise<Post[]> {
  try {
    const posts = await client.fetch<Post[]>(`
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
        "categories": [category],
        "displayExcerpt": coalesce(excerpt, description),
        "bodyLength": length(body),
        "bodyPlainText": array::join(body[_type == "block"].children[_type == "span"].text, " ")
      }
    `, {}, { 
      cache: 'no-store'
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts for analysis:', error);
    return [];
  }
}
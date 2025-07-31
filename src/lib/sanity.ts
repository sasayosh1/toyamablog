import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false, // 即時反映のため無効化
  perspective: 'published', // publishedコンテンツのみ
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
}

export type BlogPost = Post;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
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
      "excerpt": description,
      "categories": [category]
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
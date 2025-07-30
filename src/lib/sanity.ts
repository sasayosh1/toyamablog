import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
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
  `);
  
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
  `, { slug });
  
  return post;
}
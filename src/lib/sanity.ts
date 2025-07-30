<<<<<<< HEAD
import { createClient } from '@sanity/client';

// Sanityクライアントの設定
export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
  token: import.meta.env.SANITY_API_TOKEN,
});

// ブログ記事の型定義
export interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: string;
  pubDate: string;
  updatedDate?: string;
  heroImage?: {
    asset: {
      _ref: string;
      url: string;
    };
    alt?: string;
  };
  tags?: string[];
  content: Array<{
    _type: string;
    _key: string;
    [key: string]: any;
  }>;
}

// YouTube Shorts コンポーネントの型定義
export interface YouTubeShorts {
  _type: 'youtubeShorts';
  _key: string;
  url: string;
  title?: string;
  autoplay: boolean;
  showControls: boolean;
}

// YouTube URLからビデオIDを抽出する関数
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// YouTube埋め込みURLを生成する関数
export function getYouTubeEmbedUrl(videoId: string, autoplay = false, showControls = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: showControls ? '1' : '0',
    modestbranding: '1',
    rel: '0'
  });
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

// すべてのブログ記事を取得（既存のpostタイプも含む）
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const query = `
    *[_type == "blogPost"] | order(pubDate desc) {
      _id,
      title,
      slug,
      description,
      pubDate,
      updatedDate,
      heroImage {
        asset-> {
          _ref,
          url
        },
        alt
      },
      tags,
      content
    }
  `;
  
  return client.fetch(query);
}

// 既存のpostタイプの記事を取得
export async function getAllPosts(): Promise<any[]> {
  const query = `
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      body,
      publishedAt,
      tags,
      category,
      description,
      text,
      content
    }
  `;
  
  return client.fetch(query);
}

// スラッグで特定のブログ記事を取得
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `
    *[_type == "blogPost" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      pubDate,
      updatedDate,
      heroImage {
        asset-> {
          _ref,
          url
        },
        alt
      },
      tags,
      content
    }
  `;
  
  return client.fetch(query, { slug });
=======
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
>>>>>>> 31044119437df01edc0123087c142c7163545891
}
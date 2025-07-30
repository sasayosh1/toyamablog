import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export interface BlogPost {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  tags?: string[];
  category?: string;
  publishedAt: string;
  body?: any;
  youtubeUrl?: string;
}
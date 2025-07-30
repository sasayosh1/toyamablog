import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'

// 既存のpostスキーマにYouTube Shorts機能を追加
const existingPost = {
  name: 'post',
  title: '記事',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'タイトル',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: '説明',
      type: 'text'
    },
    {
      name: 'publishedAt',
      title: '公開日',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'tags',
      title: 'タグ',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'category',
      title: 'カテゴリ',
      type: 'string'
    },
    {
      name: 'text',
      title: 'テキスト',
      type: 'text'
    },
    {
      name: 'content',
      title: 'コンテンツ（旧）',
      type: 'text'
    },
    {
      name: 'body',
      title: '記事内容',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'image',
          options: {
            hotspot: true
          }
        },
        {
          name: 'youtubeShorts',
          title: 'YouTube Shorts',
          type: 'object',
          fields: [
            {
              name: 'url',
              title: 'YouTube Shorts URL',
              type: 'url',
              description: 'YouTube ShortsまたはYouTube動画のURL',
              validation: (Rule: any) => Rule.required().custom((url: string) => {
                if (!url) return true;
                
                // YouTube URL パターンをチェック
                const youtubePatterns = [
                  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
                  /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
                  /^https?:\/\/youtu\.be\/[\w-]+/
                ];
                
                const isValidYouTube = youtubePatterns.some(pattern => pattern.test(url));
                
                return isValidYouTube || 'YouTube URLを入力してください（youtube.com/watch、youtube.com/shorts、youtu.be形式）';
              })
            },
            {
              name: 'title',
              title: '動画タイトル',
              type: 'string',
              description: '動画の説明やキャプション（省略可能）'
            },
            {
              name: 'autoplay',
              title: '自動再生',
              type: 'boolean',
              initialValue: false,
              description: '動画を自動再生するかどうか'
            },
            {
              name: 'showControls',
              title: 'コントロールを表示',
              type: 'boolean',
              initialValue: true,
              description: '再生コントロールを表示するかどうか'
            }
          ],
          preview: {
            select: {
              title: 'title',
              url: 'url'
            },
            prepare({ title, url }: { title?: string; url?: string }) {
              // YouTube URLからビデオIDを抽出
              let videoId = '';
              if (url) {
                const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&\n?#]+)/);
                videoId = match ? match[1] : '';
              }
              
              return {
                title: title || 'YouTube Shorts',
                subtitle: url ? `YouTube: ${videoId}` : '未設定'
              };
            }
          }
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      date: 'publishedAt'
    },
    prepare({ title, date }: { title?: string; date?: string }) {
      return {
        title: title || '無題',
        subtitle: date ? new Date(date).toLocaleDateString('ja-JP') : '日付未設定'
      };
    }
  }
};


export default defineConfig({
  name: 'sasakiyoshimasa-blog',
  title: 'TOYAMA BLOG',
  basePath: '/studio',
  
  projectId: 'aoxze287',
  dataset: 'production',
  
  plugins: [
    deskTool(),
    visionTool()
  ],
  
  schema: {
    types: [existingPost]
  }
})
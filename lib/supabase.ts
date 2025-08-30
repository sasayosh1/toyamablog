import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバーサイド用（Service Role Key）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// データベース型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          sanity_id: string
          title: string
          slug: string
          category_id: number | null
          author_id: string | null
          published_at: string | null
          view_count: number
          like_count: number
          tags: string[]
          youtube_url: string | null
          has_map: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sanity_id: string
          title: string
          slug: string
          category_id?: number | null
          author_id?: string | null
          published_at?: string | null
          view_count?: number
          like_count?: number
          tags?: string[]
          youtube_url?: string | null
          has_map?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sanity_id?: string
          title?: string
          slug?: string
          category_id?: number | null
          author_id?: string | null
          published_at?: string | null
          view_count?: number
          like_count?: number
          tags?: string[]
          youtube_url?: string | null
          has_map?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string | null
          content: string
          parent_id: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id?: string | null
          content: string
          parent_id?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string | null
          content?: string
          parent_id?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          article_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          created_at?: string
        }
      }
      page_views: {
        Row: {
          id: string
          article_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
      }
    }
  }
}
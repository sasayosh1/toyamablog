interface CacheEntry {
  data: unknown
  timestamp: number
  priority: 'high' | 'medium' | 'low'
  accessCount: number
  lastAccessed: number
}

interface UserBehavior {
  visitedCategories: string[]
  viewedPosts: string[]
  searchQueries: string[]
  sessionStartTime: number
  interactions: number
}

class IntelligentCache {
  private cache: Map<string, CacheEntry> = new Map()
  private userBehavior: UserBehavior
  private maxCacheSize: number = 100
  private cacheTTL: number = 30 * 60 * 1000 // 30分

  constructor() {
    this.userBehavior = this.loadUserBehavior()
    this.startCleanupInterval()
  }

  // ユーザー行動の保存・読み込み
  private loadUserBehavior(): UserBehavior {
    if (typeof window === 'undefined') {
      return {
        visitedCategories: [],
        viewedPosts: [],
        searchQueries: [],
        sessionStartTime: Date.now(),
        interactions: 0
      }
    }

    const stored = localStorage.getItem('toyama-blog-behavior')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        // 無効なデータの場合は初期化
      }
    }

    return {
      visitedCategories: [],
      viewedPosts: [],
      searchQueries: [],
      sessionStartTime: Date.now(),
      interactions: 0
    }
  }

  private saveUserBehavior() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('toyama-blog-behavior', JSON.stringify(this.userBehavior))
    }
  }

  // ユーザー行動の記録
  recordPageView(postId: string, category?: string) {
    this.userBehavior.viewedPosts.push(postId)
    if (category && !this.userBehavior.visitedCategories.includes(category)) {
      this.userBehavior.visitedCategories.push(category)
    }
    this.userBehavior.interactions++
    this.saveUserBehavior()

    // 関連コンテンツの予測キャッシング
    this.predictAndCache(postId, category)
  }

  recordSearch(query: string) {
    this.userBehavior.searchQueries.push(query)
    this.userBehavior.interactions++
    this.saveUserBehavior()
  }

  // インテリジェントな予測キャッシング
  private async predictAndCache(currentPostId: string, category?: string) {
    // 1. 同じカテゴリの関連記事をキャッシュ
    if (category) {
      this.prefetchCategoryPosts(category)
    }

    // 2. ユーザーが頻繁に訪問するカテゴリをキャッシュ
    const frequentCategories = this.getFrequentCategories()
    frequentCategories.forEach(cat => this.prefetchCategoryPosts(cat))

    // 3. 人気の記事をキャッシュ
    this.prefetchPopularPosts()
  }

  private getFrequentCategories(): string[] {
    const categoryCount = this.userBehavior.visitedCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)
  }

  // キャッシュの管理
  set(key: string, data: unknown, priority: 'high' | 'medium' | 'low' = 'medium') {
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastUsed()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      priority,
      accessCount: 0,
      lastAccessed: Date.now()
    })
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // TTL チェック
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    // アクセス統計を更新
    entry.accessCount++
    entry.lastAccessed = Date.now()

    return entry.data
  }

  // 最も使用頻度の低いエントリを削除
  private evictLeastUsed() {
    let leastUsed: string | null = null
    let minScore = Infinity

    for (const [key, entry] of this.cache.entries()) {
      // 優先度、アクセス数、最終アクセス時間を考慮したスコア
      const priorityWeight = entry.priority === 'high' ? 3 : entry.priority === 'medium' ? 2 : 1
      const recencyWeight = (Date.now() - entry.lastAccessed) / (1000 * 60) // 分単位
      const score = entry.accessCount * priorityWeight - recencyWeight

      if (score < minScore) {
        minScore = score
        leastUsed = key
      }
    }

    if (leastUsed) {
      this.cache.delete(leastUsed)
    }
  }

  // バックグラウンドでの事前取得
  private async prefetchCategoryPosts(category: string) {
    const cacheKey = `category:${category}`
    if (this.get(cacheKey)) return // 既にキャッシュされている

    try {
      const response = await fetch(`/api/posts/category/${encodeURIComponent(category)}?limit=10`)
      if (response.ok) {
        const posts = await response.json()
        this.set(cacheKey, posts, 'medium')
      }
    } catch (error) {
      console.warn('カテゴリ記事の事前取得に失敗:', error)
    }
  }

  private async prefetchPopularPosts() {
    const cacheKey = 'popular:posts'
    if (this.get(cacheKey)) return

    try {
      const response = await fetch('/api/posts/popular?limit=20')
      if (response.ok) {
        const posts = await response.json()
        this.set(cacheKey, posts, 'high')
      }
    } catch (error) {
      console.warn('人気記事の事前取得に失敗:', error)
    }
  }

  // 定期的なキャッシュクリーンアップ
  private startCleanupInterval() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupExpiredEntries()
      }, 5 * 60 * 1000) // 5分ごと
    }
  }

  private cleanupExpiredEntries() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.cache.delete(key)
      }
    }
  }

  // キャッシュ統計
  getCacheStats() {
    const entries = Array.from(this.cache.entries())
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRatio: this.calculateHitRatio(),
      averageAccessCount: entries.reduce((sum, [, entry]) => sum + entry.accessCount, 0) / entries.length || 0,
      priorityDistribution: {
        high: entries.filter(([, entry]) => entry.priority === 'high').length,
        medium: entries.filter(([, entry]) => entry.priority === 'medium').length,
        low: entries.filter(([, entry]) => entry.priority === 'low').length,
      },
      userBehavior: this.userBehavior
    }
  }

  private calculateHitRatio(): number {
    // 簡易的なヒット率計算（実装は統計を持つ必要がある）
    return this.cache.size > 0 ? 0.85 : 0 // プレースホルダー
  }

  // 開発時のデバッグ情報
  logCacheStats() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧠 インテリジェントキャッシュ統計:', this.getCacheStats())
    }
  }
}

// シングルトンインスタンス
export const intelligentCache = new IntelligentCache()

// React Hookとしての利用
export function useIntelligentCache() {
  return {
    cache: intelligentCache,
    recordPageView: (postId: string, category?: string) => {
      intelligentCache.recordPageView(postId, category)
    },
    recordSearch: (query: string) => {
      intelligentCache.recordSearch(query)
    },
    getCachedData: (key: string) => {
      return intelligentCache.get(key)
    },
    setCachedData: (key: string, data: unknown, priority?: 'high' | 'medium' | 'low') => {
      intelligentCache.set(key, data, priority)
    }
  }
}
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalData {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType?: string
}

export function reportWebVitals() {
  if (typeof window === 'undefined') return

  // Core Web Vitals の収集
  onCLS(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}

function sendToAnalytics(metric: WebVitalData) {
  // Google Analytics にメトリクスを送信
  if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    const gtagFunction = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag
    gtagFunction('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_delta: Math.round(metric.delta),
      custom_parameter_1: metric.navigationType || 'navigate',
    })
  }

  // コンソールに詳細ログ出力（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Web Vital: ${metric.name}`, {
      value: `${Math.round(metric.value)}ms`,
      rating: metric.rating,
      delta: `${Math.round(metric.delta)}ms`,
      id: metric.id,
      navigationType: metric.navigationType,
    })
  }

  // パフォーマンス問題の自動検出とアラート
  const performanceThresholds = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  }

  const threshold = performanceThresholds[metric.name as keyof typeof performanceThresholds]
  if (threshold && metric.value > threshold.poor) {
    console.warn(`⚠️ パフォーマンス警告: ${metric.name} が基準値を大幅に超過`, {
      value: metric.value,
      threshold: threshold.poor,
      rating: metric.rating,
    })
  }
}

// ページ読み込み時間の測定
export function measurePageLoadTime() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const loadTime = performance.now()
    if (loadTime > 3000) {
      console.warn(`⚠️ ページ読み込み時間が3秒を超過: ${Math.round(loadTime)}ms`)
    }
  })
}

// リソース読み込み時間の監視
export function monitorResourceLoading() {
  if (typeof window === 'undefined') return

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming
        const loadTime = resourceEntry.responseEnd - resourceEntry.requestStart

        // 画像の読み込み時間を監視
        if (resourceEntry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) && loadTime > 1000) {
          console.warn(`⚠️ 画像読み込み時間が1秒を超過: ${resourceEntry.name} (${Math.round(loadTime)}ms)`)
        }

        // JavaScript/CSSの読み込み時間を監視
        if (resourceEntry.name.match(/\.(js|css)$/i) && loadTime > 500) {
          console.warn(`⚠️ スクリプト読み込み時間が500msを超過: ${resourceEntry.name} (${Math.round(loadTime)}ms)`)
        }
      }
    })
  })

  observer.observe({ entryTypes: ['resource'] })
}

// 初期化関数
export function initWebVitals() {
  reportWebVitals()
  measurePageLoadTime()
  monitorResourceLoading()
}
'use client'

import { useEffect } from 'react'
import { initWebVitals } from '@/lib/web-vitals'

export default function WebVitalsMonitor() {
  useEffect(() => {
    // WebVitals監視を初期化
    initWebVitals()

    // ページパフォーマンス情報をコンソールに出力（開発時のみ）
    if (process.env.NODE_ENV === 'development') {
      const logPerformanceInfo = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')

        console.log('📊 ページパフォーマンス情報:', {
          'DNS解決時間': `${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`,
          'サーバー応答時間': `${Math.round(navigation.responseEnd - navigation.requestStart)}ms`,
          'DOM構築時間': `${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`,
          'ページ読み込み完了': `${Math.round(navigation.loadEventEnd - navigation.startTime)}ms`,
          'First Paint': paint.find(p => p.name === 'first-paint')?.startTime ? `${Math.round(paint.find(p => p.name === 'first-paint')!.startTime)}ms` : 'N/A',
          'First Contentful Paint': paint.find(p => p.name === 'first-contentful-paint')?.startTime ? `${Math.round(paint.find(p => p.name === 'first-contentful-paint')!.startTime)}ms` : 'N/A',
        })
      }

      // ページ読み込み完了後に情報を出力
      if (document.readyState === 'complete') {
        setTimeout(logPerformanceInfo, 100)
      } else {
        window.addEventListener('load', () => {
          setTimeout(logPerformanceInfo, 100)
        })
      }
    }

    // メモリ使用量監視（開発時のみ）
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemoryUsage = () => {
        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory
        if (memory) {
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
          const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)

          if (usedMB > 50) {
            console.warn(`⚠️ メモリ使用量が高い: ${usedMB}MB / ${limitMB}MB`)
          }
        }
      }

      const memoryInterval = setInterval(checkMemoryUsage, 30000) // 30秒ごと
      return () => clearInterval(memoryInterval)
    }
  }, [])

  return null // UIは表示しない
}
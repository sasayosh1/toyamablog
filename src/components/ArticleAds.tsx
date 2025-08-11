'use client'

import { AdUnit } from '@/components/AdSense'

interface ArticleAdsProps {
  className?: string
}

// 記事上部広告（レスポンシブ）
export function TopArticleAd({ className }: ArticleAdsProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">広告</div>
      <AdUnit 
        slot="your-top-ad-slot-id" 
        format="auto"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}

// 記事中央広告（記事の途中に挿入）
export function MiddleArticleAd({ className }: ArticleAdsProps) {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">広告</div>
      <AdUnit 
        slot="your-middle-ad-slot-id" 
        format="auto"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}

// 記事下部広告
export function BottomArticleAd({ className }: ArticleAdsProps) {
  return (
    <div className={`mt-8 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">広告</div>
      <AdUnit 
        slot="your-bottom-ad-slot-id" 
        format="auto"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}

// サイドバー広告（デスクトップ）
export function SidebarAd({ className }: ArticleAdsProps) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="text-xs text-gray-500 mb-2">広告</div>
      <AdUnit 
        slot="your-sidebar-ad-slot-id" 
        format="vertical"
        responsive={false}
        className="w-full max-w-sm"
      />
    </div>
  )
}

// インフィード広告（記事一覧用）
export function InFeedAd({ className }: ArticleAdsProps) {
  return (
    <div className={`${className}`}>
      <div className="text-xs text-gray-500 mb-2">スポンサードリンク</div>
      <AdUnit 
        slot="your-infeed-ad-slot-id" 
        format="fluid"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}
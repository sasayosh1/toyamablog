'use client'

import { AdUnit } from '@/components/AdSense'

interface ArticleAdsProps {
  className?: string
}

const AD_SLOTS = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || '',
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || '',
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
  infeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || '',
}

function getSlot(value: string) {
  return /^\d+$/.test(value) ? value : ''
}

// 記事上部広告（レスポンシブ）
export function TopArticleAd({ className }: ArticleAdsProps) {
  const slot = getSlot(AD_SLOTS.top)
  if (!slot) return null
  return (
    <div className={`mb-8 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">広告</div>
      <AdUnit
        slot={slot}
        format="auto"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}

// サイドバー広告（デスクトップ）
export function SidebarAd({ className }: ArticleAdsProps) {
  const slot = getSlot(AD_SLOTS.sidebar)
  if (!slot) return null
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="text-xs text-gray-500 mb-2">広告</div>
      <AdUnit
        slot={slot}
        format="vertical"
        responsive={false}
        className="w-full max-w-sm"
      />
    </div>
  )
}

// インフィード広告（記事一覧用）
export function InFeedAd({ className }: ArticleAdsProps) {
  const slot = getSlot(AD_SLOTS.infeed)
  if (!slot) return null
  return (
    <div className={`${className}`}>
      <div className="text-xs text-gray-500 mb-2">スポンサードリンク</div>
      <AdUnit
        slot={slot}
        format="fluid"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}

// 記事下部広告（レスポンシブ）
export function BottomArticleAd({ className }: ArticleAdsProps) {
  const slot = getSlot(AD_SLOTS.bottom || AD_SLOTS.top) // Fallback to top if bottom is not set
  if (!slot) return null
  return (
    <div className={`mt-12 mb-8 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">スポンサードリンク</div>
      <AdUnit
        slot={slot}
        format="auto"
        responsive={true}
        className="w-full"
      />
    </div>
  )
}


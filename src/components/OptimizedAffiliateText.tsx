'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface OptimizedAffiliateTextProps {
  href: string
  children: React.ReactNode
  platform?: 'amazon' | 'rakuten' | 'yahoo' | 'generic'
  showIcon?: boolean
  showPRLabel?: boolean
  className?: string
}

// プラットフォームスタイルを定数として定義
const PLATFORM_STYLES = {
  amazon: 'text-orange-600 hover:text-orange-700 border-b-2 border-orange-200 hover:border-orange-300',
  rakuten: 'text-red-600 hover:text-red-700 border-b-2 border-red-200 hover:border-red-300',
  yahoo: 'text-purple-600 hover:text-purple-700 border-b-2 border-purple-200 hover:border-purple-300',
  generic: 'text-blue-600 hover:text-blue-700 border-b-2 border-blue-200 hover:border-blue-300'
} as const

const OptimizedAffiliateText = memo(function OptimizedAffiliateText({
  href,
  children,
  platform = 'generic',
  showIcon = true,
  showPRLabel = true,
  className = ''
}: OptimizedAffiliateTextProps) {
  // スタイルをメモ化して再計算を避ける
  const linkStyle = useMemo(() => PLATFORM_STYLES[platform], [platform])

  return (
    <span className="inline-block">
      <Link
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className={`inline-flex items-center font-medium transition-all duration-200 ${linkStyle} ${className}`}
        title="アフィリエイトリンク（外部サイトへ移動します）"
      >
        {children}
        {showIcon && (
          <ArrowTopRightOnSquareIcon
            className="w-3 h-3 ml-1 flex-shrink-0"
            aria-hidden="true"
          />
        )}
      </Link>
      {showPRLabel && (
        <span
          className="text-xs text-gray-400 ml-1"
          title="アフィリエイトリンク"
          aria-label="プロモーションリンク"
        >
          [PR]
        </span>
      )}
    </span>
  )
})

// プラットフォーム別のショートハンドコンポーネント（メモ化済み）
export const OptimizedAmazonLink = memo(function OptimizedAmazonLink({
  href,
  children,
  ...props
}: Omit<OptimizedAffiliateTextProps, 'platform'>) {
  return (
    <OptimizedAffiliateText href={href} platform="amazon" {...props}>
      {children}
    </OptimizedAffiliateText>
  )
})

export const OptimizedRakutenLink = memo(function OptimizedRakutenLink({
  href,
  children,
  ...props
}: Omit<OptimizedAffiliateTextProps, 'platform'>) {
  return (
    <OptimizedAffiliateText href={href} platform="rakuten" {...props}>
      {children}
    </OptimizedAffiliateText>
  )
})

export const OptimizedYahooLink = memo(function OptimizedYahooLink({
  href,
  children,
  ...props
}: Omit<OptimizedAffiliateTextProps, 'platform'>) {
  return (
    <OptimizedAffiliateText href={href} platform="yahoo" {...props}>
      {children}
    </OptimizedAffiliateText>
  )
})

export default OptimizedAffiliateText
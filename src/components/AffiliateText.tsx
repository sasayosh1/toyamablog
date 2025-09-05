'use client'

import SimpleAffiliateLink from './SimpleAffiliateLink'

// Amazon用ショートハンド
export function AmazonLink({ href, children, showIcon = true, className = '' }: {
  href: string
  children: React.ReactNode
  showIcon?: boolean
  className?: string
}) {
  return (
    <SimpleAffiliateLink href={href} platform="amazon" showIcon={showIcon} className={className}>
      {children}
    </SimpleAffiliateLink>
  )
}

// 楽天用ショートハンド
export function RakutenLink({ href, children, showIcon = true, className = '' }: {
  href: string
  children: React.ReactNode
  showIcon?: boolean
  className?: string
}) {
  return (
    <SimpleAffiliateLink href={href} platform="rakuten" showIcon={showIcon} className={className}>
      {children}
    </SimpleAffiliateLink>
  )
}

// Yahoo!ショッピング用ショートハンド
export function YahooLink({ href, children, showIcon = true, className = '' }: {
  href: string
  children: React.ReactNode
  showIcon?: boolean
  className?: string
}) {
  return (
    <SimpleAffiliateLink href={href} platform="yahoo" showIcon={showIcon} className={className}>
      {children}
    </SimpleAffiliateLink>
  )
}

// 汎用アフィリエイトリンク
export function AffiliateText({ href, children, showIcon = true, className = '' }: {
  href: string
  children: React.ReactNode
  showIcon?: boolean
  className?: string
}) {
  return (
    <SimpleAffiliateLink href={href} platform="generic" showIcon={showIcon} className={className}>
      {children}
    </SimpleAffiliateLink>
  )
}
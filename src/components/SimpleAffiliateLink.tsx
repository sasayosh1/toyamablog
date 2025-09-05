'use client'

import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface SimpleAffiliateLinkProps {
  href: string
  children: React.ReactNode
  platform?: 'amazon' | 'rakuten' | 'yahoo' | 'generic'
  showIcon?: boolean
  className?: string
}

const platformStyles = {
  amazon: 'text-orange-600 hover:text-orange-700 border-b-2 border-orange-200 hover:border-orange-300',
  rakuten: 'text-red-600 hover:text-red-700 border-b-2 border-red-200 hover:border-red-300',
  yahoo: 'text-purple-600 hover:text-purple-700 border-b-2 border-purple-200 hover:border-purple-300',
  generic: 'text-blue-600 hover:text-blue-700 border-b-2 border-blue-200 hover:border-blue-300'
}

export default function SimpleAffiliateLink({
  href,
  children,
  platform = 'generic',
  showIcon = true,
  className = ''
}: SimpleAffiliateLinkProps) {
  const style = platformStyles[platform]

  return (
    <span className="inline-block">
      <Link
        href={href}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className={`inline-flex items-center font-medium transition-all duration-200 ${style} ${className}`}
        title="アフィリエイトリンク（外部サイトへ移動します）"
      >
        {children}
        {showIcon && (
          <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1 flex-shrink-0" />
        )}
      </Link>
      <span className="text-xs text-gray-400 ml-1" title="アフィリエイトリンク">
        [PR]
      </span>
    </span>
  )
}
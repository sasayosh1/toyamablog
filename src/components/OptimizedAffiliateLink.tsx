'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface OptimizedAffiliateLinkProps {
  href: string
  title: string
  description?: string
  price?: string
  imageUrl?: string
  buttonText?: string
  platform?: 'amazon' | 'rakuten' | 'yahoo' | 'generic'
  className?: string
  lazy?: boolean
}

// プラットフォーム設定をメモ化
const PLATFORM_CONFIG = {
  amazon: {
    bg: 'bg-orange-500 hover:bg-orange-600',
    text: 'text-white',
    name: 'Amazon'
  },
  rakuten: {
    bg: 'bg-red-600 hover:bg-red-700',
    text: 'text-white',
    name: '楽天市場'
  },
  yahoo: {
    bg: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-white',
    name: 'Yahoo!ショッピング'
  },
  generic: {
    bg: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-white',
    name: '詳細を見る'
  }
} as const

const OptimizedAffiliateLink = memo(function OptimizedAffiliateLink({
  href,
  title,
  description,
  price,
  imageUrl,
  buttonText,
  platform = 'generic',
  className = '',
  lazy = true
}: OptimizedAffiliateLinkProps) {
  // プラットフォーム設定をメモ化
  const config = useMemo(() => PLATFORM_CONFIG[platform], [platform])
  const displayButtonText = useMemo(() =>
    buttonText || `${config.name}で見る`,
    [buttonText, config.name]
  )

  return (
    <article
      className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="flex flex-col sm:flex-row">
        {imageUrl && (
          <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 relative">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
              loading={lazy ? "lazy" : "eager"}
              quality={75}
              itemProp="image"
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <h3
            className="font-bold text-lg mb-2 text-gray-900 line-clamp-2"
            itemProp="name"
          >
            {title}
          </h3>

          {description && (
            <p
              className="text-gray-600 text-sm mb-3 line-clamp-3"
              itemProp="description"
            >
              {description}
            </p>
          )}

          {price && (
            <div className="mb-3" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span
                className="text-2xl font-bold text-red-600"
                itemProp="price"
              >
                {price}
              </span>
            </div>
          )}

          <Link
            href={href}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${config.bg} ${config.text}`}
            aria-label={`${title}を${config.name}で確認する（外部サイト）`}
          >
            {displayButtonText}
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* アフィリエイト表示 */}
      <footer className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          ※このリンクはアフィリエイトリンクです。商品購入により収益が発生する場合があります。
        </p>
      </footer>
    </article>
  )
})

export default OptimizedAffiliateLink
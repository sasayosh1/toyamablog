'use client'

import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface AffiliateLinkProps {
  href: string
  title: string
  description?: string
  price?: string
  imageUrl?: string
  buttonText?: string
  platform?: 'amazon' | 'rakuten' | 'yahoo' | 'generic'
  className?: string
}

const platformStyles = {
  amazon: {
    bg: 'bg-orange-500 hover:bg-orange-600',
    text: 'text-white',
    border: 'border-orange-500'
  },
  rakuten: {
    bg: 'bg-red-600 hover:bg-red-700', 
    text: 'text-white',
    border: 'border-red-600'
  },
  yahoo: {
    bg: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-white', 
    border: 'border-purple-600'
  },
  generic: {
    bg: 'bg-blue-600 hover:bg-blue-700',
    text: 'text-white',
    border: 'border-blue-600'
  }
}

const platformNames = {
  amazon: 'Amazon',
  rakuten: '楽天市場',
  yahoo: 'Yahoo!ショッピング',
  generic: '詳細を見る'
}

export default function AffiliateLink({
  href,
  title,
  description,
  price,
  imageUrl,
  buttonText,
  platform = 'generic',
  className = ''
}: AffiliateLinkProps) {
  const style = platformStyles[platform]
  const defaultButtonText = buttonText || `${platformNames[platform]}で見る`

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex flex-col sm:flex-row">
        {imageUrl && (
          <div className="w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 p-4">
          <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {description}
            </p>
          )}
          
          {price && (
            <div className="mb-3">
              <span className="text-2xl font-bold text-red-600">{price}</span>
            </div>
          )}
          
          <Link
            href={href}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${style.bg} ${style.text}`}
          >
            {defaultButtonText}
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
      
      {/* アフィリエイト表示 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          ※このリンクはアフィリエイトリンクです。商品購入により収益が発生する場合があります。
        </p>
      </div>
    </div>
  )
}
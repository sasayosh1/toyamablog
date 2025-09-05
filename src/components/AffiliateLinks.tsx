'use client'

import AffiliateLink from './AffiliateLink'

interface AffiliateItem {
  href: string
  title: string
  description?: string
  price?: string
  imageUrl?: string
  buttonText?: string
  platform?: 'amazon' | 'rakuten' | 'yahoo' | 'generic'
}

interface AffiliateLinksProps {
  title?: string
  items: AffiliateItem[]
  layout?: 'vertical' | 'horizontal' | 'grid'
  className?: string
}

export default function AffiliateLinks({
  title = 'おすすめ商品',
  items,
  layout = 'vertical',
  className = ''
}: AffiliateLinksProps) {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-col lg:flex-row gap-4'
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4'
      default:
        return 'space-y-4'
    }
  }

  return (
    <div className={`my-8 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-900 border-l-4 border-blue-500 pl-3">
          {title}
        </h3>
      )}
      
      <div className={getLayoutClasses()}>
        {items.map((item, index) => (
          <AffiliateLink
            key={index}
            {...item}
            className={layout === 'horizontal' ? 'flex-1' : ''}
          />
        ))}
      </div>
      
      {/* 免責事項 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-gray-600">
          <span className="font-medium">免責事項：</span>
          当サイトで紹介している商品・サービス等の外部リンクには、アフィリエイト広告が含まれる場合があります。
          商品購入やサービス利用により、当サイトに収益が発生することがありますが、
          掲載内容については公平性を保つよう努めております。
        </p>
      </div>
    </div>
  )
}
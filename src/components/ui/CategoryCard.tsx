import Link from 'next/link'

interface CategoryCardProps {
  name: string
  count: number
  href: string
  variant?: 'default' | 'compact'
}

export default function CategoryCard({ 
  name, 
  count, 
  href, 
  variant = 'default' 
}: CategoryCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group block p-4 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all border border-gray-100 hover:border-blue-200"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
            {name}
          </span>
          <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
            {count}
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg hover:bg-green-50 transition-all duration-200 border border-gray-200 group-hover:border-green-300 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium group-hover:bg-green-200">
            {count}記事
          </span>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors mb-3 line-clamp-2">
          {name}
        </h2>
        
        <div className="flex items-center text-green-600 group-hover:text-green-700 transition-colors">
          <span className="text-sm font-medium">記事を見る</span>
          <svg 
            className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
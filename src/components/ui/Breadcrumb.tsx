import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  // タイトルを省略する関数
  const truncateTitle = (title: string, isLast: boolean = false) => {
    if (isLast && title.length > 40) {
      return title.substring(0, 40) + '⋯'
    } else if (!isLast && title.length > 20) {
      return title.substring(0, 20) + '⋯'
    }
    return title
  }

  return (
    <nav className="mb-6" aria-label="パンくず">
      <div className="flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const truncatedLabel = truncateTitle(item.label, isLast)
          
          return (
            <div key={index} className="flex items-center flex-shrink-0">
              {index > 0 && (
                <svg className="w-4 h-4 mx-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
              {item.href ? (
                <Link href={item.href} className="hover:text-blue-600 transition-colors flex items-center flex-shrink-0" title={item.label}>
                  {item.icon && <span className="mr-1 flex-shrink-0">{item.icon}</span>}
                  <span className="truncate">{truncatedLabel}</span>
                </Link>
              ) : (
                <span className="text-gray-900 font-medium flex items-center flex-shrink-0" title={item.label}>
                  {item.icon && <span className="mr-1 flex-shrink-0">{item.icon}</span>}
                  <span className="truncate">{truncatedLabel}</span>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
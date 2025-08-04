'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: Array<{
    style?: string
    children?: Array<{ text: string }>
  }>
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // contentからH2とH3を抽出
    const items: TocItem[] = []
    
    content?.forEach((block) => {
      if (block.style === 'h2' || block.style === 'h3') {
        const text = block.children?.map((child) => child.text).join('') || ''
        if (text.trim()) {
          const cleanText = text.trim()
          const id = `heading-${block.style}-${cleanText.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
          items.push({
            id,
            text: cleanText,
            level: block.style === 'h2' ? 2 : 3
          })
        }
      }
    })
    
    setTocItems(items)
  }, [content])

  if (tocItems.length === 0) {
    return null
  }

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 表示する項目数の制御（初期表示は2項目のみ）
  const INITIAL_DISPLAY_COUNT = 2
  const displayItems = isExpanded ? tocItems : tocItems.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreItems = tocItems.length > INITIAL_DISPLAY_COUNT

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="flex items-center">
          <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-1.5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <h3 className="text-sm md:text-base font-medium text-gray-800">📋 もくじ</h3>
        </div>
        <span className="text-xs text-gray-500">{tocItems.length}項目</span>
      </div>
      
      <nav>
        <ul className="space-y-0.5 md:space-y-1">
          {displayItems.map((item) => (
            <li key={item.id} className={item.level === 3 ? 'ml-2 md:ml-3' : ''}>
              <button
                onClick={() => handleScrollTo(item.id)}
                className={`
                  text-left w-full py-1 md:py-1.5 px-1.5 md:px-2 rounded text-xs md:text-sm hover:bg-gray-50 transition-colors duration-150
                  ${item.level === 2 
                    ? 'text-gray-800 font-medium hover:text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                  }
                `}
              >
                <span className="flex items-start leading-tight">
                  <span className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full mt-1 md:mt-1.5 mr-1.5 md:mr-2 flex-shrink-0 ${
                    item.level === 2 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="line-clamp-2">{item.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        
        {hasMoreItems && (
          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center py-1 md:py-1.5 text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-150 font-medium"
            >
              {isExpanded ? (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  閉じる
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  さらに表示 ({tocItems.length - INITIAL_DISPLAY_COUNT}項目)
                </span>
              )}
            </button>
          </div>
        )}
      </nav>
    </div>
  )
}
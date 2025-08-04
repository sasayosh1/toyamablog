'use client'

import { useEffect, useState, useCallback } from 'react'
import { generateHeadingId } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface ContentBlock {
  style?: string
  children?: Array<{ text: string }>
}

interface TableOfContentsProps {
  content: Array<ContentBlock>
}

const INITIAL_DISPLAY_COUNT = 2

// ヘルパー関数: コンテンツからTOC項目を抽出
const extractTocItems = (content: Array<ContentBlock>): TocItem[] => {
  const items: TocItem[] = []
  
  content?.forEach((block) => {
    if (block.style === 'h2' || block.style === 'h3') {
      const text = block.children?.map((child) => child.text).join('') || ''
      if (text.trim()) {
        const cleanText = text.trim()
        const id = generateHeadingId(cleanText, block.style)
        items.push({
          id,
          text: cleanText,
          level: block.style === 'h2' ? 2 : 3
        })
      }
    }
  })
  
  return items
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const items = extractTocItems(content)
    setTocItems(items)
  }, [content])

  const handleScrollTo = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (tocItems.length === 0) {
    return null
  }

  // 表示する項目数の制御
  const displayItems = isExpanded ? tocItems : tocItems.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMoreItems = tocItems.length > INITIAL_DISPLAY_COUNT

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6 shadow-sm">
      <div className="flex items-center mb-2 md:mb-3">
        <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mr-1.5 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <h3 className="text-sm md:text-base font-medium text-gray-800">もくじ</h3>
      </div>
      
      <nav>
        <ul className="space-y-1 md:space-y-2">
          {displayItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleScrollTo(item.id)}
                className={`
                  text-left w-full py-2 md:py-2.5 px-2 md:px-3 rounded-md hover:bg-blue-50 transition-colors duration-200 border-l-2 hover:border-l-blue-400
                  ${item.level === 2 
                    ? 'text-gray-800 font-semibold text-sm md:text-base border-l-blue-300 hover:text-blue-800' 
                    : 'text-gray-600 font-medium text-xs md:text-sm border-l-gray-200 hover:text-blue-700 ml-3 md:ml-4'
                  }
                `}
              >
                <span className="block leading-relaxed line-clamp-2">
                  {item.level === 2 && <span className="text-blue-600 mr-2 font-bold">▍</span>}
                  {item.level === 3 && <span className="text-gray-400 mr-2">▸</span>}
                  {item.text}
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
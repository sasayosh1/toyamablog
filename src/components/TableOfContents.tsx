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
  const [isMounted, setIsMounted] = useState(false)
  const [forceKey, setForceKey] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    const items = extractTocItems(content)
    setTocItems(items)
    setForceKey(Date.now()) // 強制更新用
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

  // 完全に項目を非表示にする（強制）
  const shouldShowItems = isMounted && isExpanded && tocItems.length > 0
  const displayItems = shouldShowItems ? tocItems : []
  const hasItems = tocItems.length > 0
  
  // SSRの場合は何も表示しない
  if (!isMounted) {
    return null
  }
  
  // デバッグ用コンソールログ
  if (typeof window !== 'undefined') {
    console.log('TOC Debug:', {
      isMounted,
      isExpanded,
      tocItemsLength: tocItems.length,
      shouldShowItems,
      displayItemsLength: displayItems.length
    })
  }

  return (
    <div key={`toc-${forceKey}`} className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-4 md:p-5 mb-6 md:mb-8 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800">もくじ</h3>
        </div>
      </div>
      
      {shouldShowItems && displayItems.length > 0 && (
        <nav className="mt-4">
          <div className="bg-white rounded-lg p-3 shadow-inner">
            <ul className="space-y-2">
              {displayItems.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleScrollTo(item.id)}
                    className={`
                      group text-left w-full py-2.5 px-3 rounded-lg transition-all duration-200 hover:shadow-sm
                      ${item.level === 2 
                        ? 'text-gray-800 font-semibold text-sm bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 hover:to-blue-50 border-l-4 border-blue-400' 
                        : 'text-gray-600 font-medium text-xs bg-gradient-to-r from-gray-50 to-transparent hover:from-gray-100 hover:to-gray-50 ml-4 border-l-2 border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <span className={`mr-3 mt-1 ${item.level === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {item.level === 2 ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ) : (
                          <svg className="w-2 h-2 mt-1" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </span>
                      <span className="leading-relaxed line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {item.text}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
      
      {hasItems && (
        <div className={isExpanded ? "mt-4 pt-3 border-t border-blue-200" : ""}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02]"
          >
            {isExpanded ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
                もくじを閉じる
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
                もくじを表示
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
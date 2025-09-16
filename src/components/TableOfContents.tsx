'use client'

import { useEffect, useMemo, useState } from 'react'
import { generateHeadingId } from '@/lib/utils'

type Block = {
  _type?: string
  style?: string
  children?: Array<{ text: string }>
}

type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

type Props = {
  content: Block[] | unknown
}

export default function TableOfContents({ content }: Props) {
  const [isMounted, setIsMounted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const items = useMemo<TocItem[]>(() => {
    const blocks = Array.isArray(content) ? (content as Block[]) : []
    const headings = blocks
      .filter(b => b?.style === 'h2' || b?.style === 'h3')
      .map((b) => {
        const raw = (b?.children?.map(c => c.text).join('') || '').trim()
        const text = raw || '（無題の見出し）'
        const id = generateHeadingId(text, b.style || 'h2')
        return {
          id,
          text,
          level: (b.style === 'h3' ? 3 : 2) as 2 | 3
        }
      })
    return headings
  }, [content])

  // SSR/ハイドレーション安全性のため、マウント後のみ表示
  if (!isMounted) return null
  
  // 見出しが無い場合は非表示
  if (items.length === 0) return null

  return (
    <div className="flex justify-center mb-6 md:mb-8">
      <section
        className="w-full max-w-2xl bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl p-4 md:p-5 shadow-sm"
        aria-label="ページの目次"
      >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800">もくじ</h3>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(v => !v)}
          className="py-2 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {isExpanded ? '閉じる' : 'もくじを表示'}
        </button>
      </div>

      {isExpanded && (
        <nav className="mt-4" aria-label="目次の項目">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={`${item.id}-${idx}`} className={item.level === 3 ? 'ml-4' : ''}>
                <a
                  href={`#${item.id}`}
                  className="block text-sm text-blue-700 hover:text-blue-900 underline-offset-2 hover:underline"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      </section>
    </div>
  )
}
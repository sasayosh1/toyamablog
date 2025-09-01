'use client'

import { useState } from 'react'
import { Post } from '@/lib/sanity'
import Link from 'next/link'

// MenuLink コンポーネント（Client Component）
interface MenuLinkProps {
  href: string
  className: string
  onMenuClick: () => void
  children: React.ReactNode
}

function MenuLink({ href, className, onMenuClick, children }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={onMenuClick}
    >
      {children}
    </Link>
  )
}

interface GlobalHeaderProps {
  posts: Post[]
  categories?: string[]
}

export default function GlobalHeader({ posts: _, categories = [] }: GlobalHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)


  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-lg backdrop-blur-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* PC用メニュー（lg以上で表示） */}
        <div className="hidden lg:flex items-center justify-between h-16">
          {/* PCナビゲーション */}
          <nav className="flex items-center space-x-8">
            <Link href="/" className="font-medium transition-colors text-gray-800 hover:text-blue-600">
              ホーム
            </Link>
            <Link href="/categories" className="font-medium transition-colors text-gray-800 hover:text-blue-600">
              地域別カテゴリー
            </Link>
            <Link href="/about" className="font-medium transition-colors text-gray-800 hover:text-blue-600">
              サイトについて
            </Link>
          </nav>

        </div>

        {/* モバイル用メニュー（lg未満で表示） */}
        <div className="lg:hidden flex items-center justify-between h-16">
          {/* ハンバーガーメニューボタン - 44px最小タッチターゲット */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] focus:outline-none transition-colors text-gray-800 hover:text-blue-600 rounded-md hover:bg-gray-100 active:bg-gray-200"
            data-testid="hamburger-menu"
            aria-label="メニュー"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>
      </div>

      {/* モバイル用ハンバーガーメニュー */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg" data-testid="mobile-menu">
          <nav className="max-w-7xl mx-auto px-4 py-4" aria-label="mobile">
            <div className="flex flex-col space-y-3">
              <MenuLink
                href="/"
                className="flex items-center px-4 py-3 min-h-[44px] text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                onMenuClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                ホーム
              </MenuLink>
              <MenuLink
                href="/categories"
                className="flex items-center px-4 py-3 min-h-[44px] text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                onMenuClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                地域別カテゴリー
              </MenuLink>
              <MenuLink
                href="/about"
                className="flex items-center px-4 py-3 min-h-[44px] text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                onMenuClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                サイトについて
              </MenuLink>
              
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
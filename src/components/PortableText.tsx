'use client'

import React from 'react'
import Image from 'next/image'
import { PortableText as BasePortableText } from '@portabletext/react'
import { urlForImage } from '@/sanity/lib/image'
import { extractYouTubeId, generateHeadingId, stripShortsAndHashtags } from '@/lib/utils'

// HTMLコンテンツをパースして処理する関数
function processTextContent(text: string): string {
  // YouTube iframeを検出して置換
  const youtubeIframeRegex = /<iframe[^>]*src="[^"]*youtube\.com\/embed\/([^"]*)"[^>]*><\/iframe>/gi
  
  if (youtubeIframeRegex.test(text)) {
    return text.replace(youtubeIframeRegex, (match, videoId) => {
      return `[YouTube: ${videoId}]`
    })
  }

  // URLを検出してリンクに変換（http://, https://, www.を含むすべてのパターン）
  const urlRegex = /(https?:\/\/(?:www\.)?[^\s<]+|www\.[^\s<]+)/g
  if (urlRegex.test(text)) {
    const parts = text.split(urlRegex)
    return parts.map((part) => {
      if (urlRegex.test(part)) {
        return `🔗 ${part}`
      }
      return part
    }).join('')
  }

  // <br />タグを改行に置換
  return text.replace(/<br\s*\/?>/gi, '\n')
}

// テキスト内の太字記法を処理するヘルパー関数
function processTextWithBold(text: string): React.ReactNode[] {
  const processed = processTextContent(text)
  // 改行を<br>タグに変換し、太字記法(**text**)を処理
  return processed.split('\n').map((line, index, array) => {
    // 太字記法をパース
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    const lineContent = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      }
      return part
    })

    return (
      <React.Fragment key={index}>
        {lineContent}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

// markdown風の簡易記法を判定してReact要素を返す
function renderMarkdownish(text: string): React.ReactNode {
  const cleanedText = stripShortsAndHashtags(text)
  if (!cleanedText) return null

  const headingMatch = cleanedText.match(/^(#{1,6})\s+(.*)$/)
  if (headingMatch) {
    const level = headingMatch[1].length
    const content = headingMatch[2]
    const Tag = (`h${Math.min(level, 6)}`) as keyof React.JSX.IntrinsicElements
    const classNames =
      level <= 2
        ? 'text-lg md:text-xl font-semibold text-gray-800 border-l-3 border-blue-500 pl-3 md:pl-4 my-4 md:my-6'
        : level === 3
        ? 'text-base md:text-lg font-medium text-gray-700 my-3 md:my-4'
        : 'text-base font-medium text-gray-700 my-2'
    return <Tag className={classNames}>{content}</Tag>
  }

  // 箇条書き（* または - で始まる行が複数ある場合）
  const lines = cleanedText.split('\n')
  const listLines = lines.filter((line) => line.trim().startsWith('* ') || line.trim().startsWith('- '))
  if (listLines.length >= 2 || (listLines.length === lines.length && listLines.length > 0)) {
    return (
      <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
        {lines
          .filter((line) => line.trim())
          .map((line, idx) => {
            const isList = line.trim().startsWith('* ') || line.trim().startsWith('- ')
            const body = isList ? line.trim().slice(2) : line
            return (
              <li key={idx} style={{ margin: '0.5rem 0', lineHeight: '1.6' }}>
                {processTextWithBold(body)}
              </li>
            )
          })}
      </ul>
    )
  }

  // デフォルト: 太字を処理した段落
  return (
    <p
      style={{
        margin: '1rem 0',
        lineHeight: '1.7',
        fontSize: '1.125rem',
        whiteSpace: 'pre-wrap',
      }}
    >
      {processTextWithBold(cleanedText)}
    </p>
  )
}

// カスタムコンポーネントの定義
const components = {
  types: {
    // Googleマップを完全にスキップ（クラウドルール：専用セクションで表示）
    googleMaps: () => null,
    // HTMLタイプの処理（Googleマップは完全除外）
    html: ({ value }: { value: { html: string } }) => {
      if (!value?.html) return null
      
      // Googleマップ関連のHTMLを完全に除外（クラウドルール：専用セクションで表示）
      const isGoogleMap = value.html.includes('google.com/maps/embed') ||
                         value.html.includes('maps.google.com') ||
                         value.html.includes('www.google.com/maps') ||
                         value.html.toLowerCase().includes('iframe') && 
                         (value.html.includes('maps') || value.html.includes('embed'))
      
      if (isGoogleMap) {
        console.log('PortableText: Googleマップを検出し、表示をスキップしました', value.html.substring(0, 100))
        return null
      }
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: value.html }}
          style={{ margin: '1rem 0' }}
        />
      )
    },
    image: ({ value }: { value: { asset?: { _ref: string }; alt?: string; caption?: string } }) => {
      if (!value?.asset?._ref) {
        return null
      }
      
      const imageUrl = urlForImage(value).width(800).height(600).fit('max').auto('format').url()
      
      return (
        <div style={{ margin: '2rem 0' }}>
          <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <Image
              src={imageUrl}
              alt={value.alt || 'ブログ画像'}
              fill
              className="object-cover rounded-lg shadow-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw"
              loading="lazy"
              quality={85}
            />
          </div>
          {value.caption && (
            <p style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#111827',
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              {value.caption}
            </p>
          )}
        </div>
      )
    },
    youtube: ({ value }: { value: { url: string } }) => {
      const { url } = value
      const videoId = extractYouTubeId(url)
      
      if (!videoId) {
        return (
          <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
            動画を読み込めませんでした
          </div>
        )
      }

      return (
        <div style={{ 
          margin: '2rem 0',
          position: 'relative',
          paddingBottom: '56.25%', // 16:9アスペクト比
          height: 0,
          overflow: 'hidden'
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video"
          />
        </div>
      )
    },
    youtubeShorts: ({ value }: { value: { url: string } }) => {
      const { url } = value
      const videoId = extractYouTubeId(url)
      
      if (!videoId) {
        return (
          <div style={{ 
            margin: '2rem 0',
            padding: '1rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>YouTube Shorts: {url}</p>
          </div>
        )
      }

      return (
        <div style={{ 
          margin: '2rem 0',
          position: 'relative',
          paddingBottom: '56.25%', // 16:9アスペクト比
          height: 0,
          overflow: 'hidden'
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '8px'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Shorts video"
          />
        </div>
      )
    },
  },
  marks: {
    link: ({ children, value }: { children: React.ReactNode; value: { href: string } }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a
          href={value.href}
          rel={rel}
          style={{
            color: '#2563eb',
            textDecoration: 'underline',
            textDecorationColor: 'transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1d4ed8'
            e.currentTarget.style.textDecorationColor = '#1d4ed8'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#2563eb'
            e.currentTarget.style.textDecorationColor = 'transparent'
          }}
        >
          {children}
        </a>
      )
    },
    affiliateLink: ({ children, value }: { 
      children: React.ReactNode; 
      value: { 
        href: string; 
        platform?: 'amazon' | 'rakuten' | 'yahoo' | 'generic';
        showIcon?: boolean;
      } 
    }) => {
      const { href, platform = 'generic', showIcon = true } = value
      
      const platformStyles = {
        amazon: 'text-orange-600 hover:text-orange-700 border-b-2 border-orange-200 hover:border-orange-300',
        rakuten: 'text-red-600 hover:text-red-700 border-b-2 border-red-200 hover:border-red-300',
        yahoo: 'text-purple-600 hover:text-purple-700 border-b-2 border-purple-200 hover:border-purple-300',
        generic: 'text-blue-600 hover:text-blue-700 border-b-2 border-blue-200 hover:border-blue-300'
      }
      
      return (
        <span style={{ display: 'inline-block' }}>
          <a
            href={href}
            target="_blank"
            rel="nofollow noopener noreferrer"
            title="アフィリエイトリンク（外部サイトへ移動します）"
            style={{
              fontWeight: 'bold',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              ...(platform === 'amazon' ? { color: '#ea580c' } :
                  platform === 'rakuten' ? { color: '#dc2626' } :
                  platform === 'yahoo' ? { color: '#7c3aed' } :
                  { color: '#2563eb' })
            }}
            onMouseEnter={(e) => {
              const colors = {
                amazon: '#c2410c',
                rakuten: '#b91c1c', 
                yahoo: '#6d28d9',
                generic: '#1d4ed8'
              }
              e.currentTarget.style.color = colors[platform as keyof typeof colors]
              e.currentTarget.style.textDecorationColor = colors[platform as keyof typeof colors]
            }}
            onMouseLeave={(e) => {
              const colors = {
                amazon: '#ea580c',
                rakuten: '#dc2626',
                yahoo: '#7c3aed', 
                generic: '#2563eb'
              }
              e.currentTarget.style.color = colors[platform as keyof typeof colors]
              e.currentTarget.style.textDecorationColor = 'transparent'
            }}
          >
            {children}
            {showIcon && (
              <span style={{ 
                marginLeft: '4px', 
                fontSize: '12px',
                opacity: 0.7
              }}>
                ↗
              </span>
            )}
          </a>
          <span 
            style={{ 
              fontSize: '12px', 
              color: '#9ca3af', 
              marginLeft: '4px' 
            }} 
            title="アフィリエイトリンク"
          >
            [PR]
          </span>
        </span>
      )
    },
  },
  block: {
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        margin: '2rem 0 1rem 0',
        lineHeight: '1.2'
      }}>
        {children}
      </h1>
    ),
    h2: ({ children, value }: { children: React.ReactNode; value?: { children?: { text: string }[] } }) => {
      const text = value?.children?.map((child) => child.text).join('') || ''
      const id = generateHeadingId(text, 'h2')
      
      return (
        <h2 
          id={id}
          className="text-lg md:text-xl font-semibold text-gray-800 border-l-3 border-blue-500 pl-3 md:pl-4 my-4 md:my-6"
          style={{ 
            lineHeight: '1.4',
            scrollMarginTop: '80px'
          }}
        >
          {children}
        </h2>
      )
    },
    h3: ({ children, value }: { children: React.ReactNode; value?: { children?: { text: string }[] } }) => {
      const text = value?.children?.map((child) => child.text).join('') || ''
      const id = generateHeadingId(text, 'h3')
      
      return (
        <h3 
          id={id}
          className="text-base md:text-lg font-medium text-gray-700 my-3 md:my-4"
          style={{ 
            lineHeight: '1.4',
            scrollMarginTop: '80px'
          }}
        >
          {children}
        </h3>
      )
    },
    normal: ({ children }: { children: React.ReactNode }) => {
      // 文字列のみのブロックにmarkdown風記法が含まれる場合はパースして表示
      if (React.Children.count(children) === 1) {
        const onlyChild = React.Children.toArray(children)[0]
        if (typeof onlyChild === 'string') {
          return renderMarkdownish(onlyChild)
        }
      }

      return (
        <p
          style={{
            margin: '1rem 0',
            lineHeight: '1.7',
            fontSize: '1.125rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {children}
        </p>
      )
    },
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote style={{
        borderLeft: '4px solid #0070f3',
        paddingLeft: '1rem',
        margin: '1.5rem 0',
        fontStyle: 'italic',
        color: '#111827'
      }}>
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children: React.ReactNode }) => (
      <ul style={{ 
        margin: '1rem 0',
        paddingLeft: '1.5rem'
      }}>
        {children}
      </ul>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <ol style={{ 
        margin: '1rem 0',
        paddingLeft: '1.5rem'
      }}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children: React.ReactNode }) => {
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processTextWithBold(child)
        }
        return child
      })
      return (
        <li style={{ 
          margin: '0.5rem 0',
          lineHeight: '1.6'
        }}>
          {processedChildren}
        </li>
      )
    },
    number: ({ children }: { children: React.ReactNode }) => {
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processTextWithBold(child)
        }
        return child
      })
      return (
        <li style={{ 
          margin: '0.5rem 0',
          lineHeight: '1.6'
        }}>
          {processedChildren}
        </li>
      )
    },
  },
}

interface PortableTextProps {
  value: unknown
}

export default function PortableText({ value }: PortableTextProps) {
  return <BasePortableText value={value as never} components={components as never} />
}

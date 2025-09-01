import React from 'react'
import { PortableText as BasePortableText } from '@portabletext/react'
import { urlForImage } from '@/sanity/lib/image'
import { extractYouTubeId, generateHeadingId } from '@/lib/utils'

// HTMLコンテンツをパースして処理する関数
function processTextContent(text: string): React.ReactNode {
  // YouTube iframeを検出して置換
  const youtubeIframeRegex = /<iframe[^>]*src="[^"]*youtube\.com\/embed\/([^"]*)"[^>]*><\/iframe>/gi
  
  if (youtubeIframeRegex.test(text)) {
    return text.replace(youtubeIframeRegex, (match, videoId) => {
      return `[YouTube: ${videoId}]`
    })
  }

  // URLを検出してリンクに変換
  const urlRegex = /(https?:\/\/[^\s<]+)/g
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

// カスタムコンポーネントの定義
const components = {
  types: {
    image: ({ value }: { value: { asset?: { _ref: string }; alt?: string; caption?: string } }) => {
      if (!value?.asset?._ref) {
        return null
      }
      
      return (
        <div style={{ margin: '2rem 0' }}>
          <img
            src={urlForImage(value).width(800).height(600).fit('max').auto('format').url()}
            alt={value.alt || 'Blog image'}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
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
          <div style={{ 
            margin: '2rem 0',
            padding: '1rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>YouTube動画: {url}</p>
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
    html: ({ value }: { value: { html: string } }) => {
      if (!value?.html) {
        return null
      }
      
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: value.html }}
          style={{ margin: '1rem 0' }}
        />
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
            color: '#0070f3',
            textDecoration: 'none',
          }}
        >
          {children}
        </a>
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
      // 子要素がテキストの場合、HTMLコンテンツを処理
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          const processed = processTextContent(child)
          if (typeof processed === 'string') {
            // 改行を<br>タグに変換
            return processed.split('\n').map((line, index, array) => (
              <React.Fragment key={index}>
                {line}
                {index < array.length - 1 && <br />}
              </React.Fragment>
            ))
          }
          return processed
        }
        return child
      })

      return (
        <p style={{ 
          margin: '1rem 0',
          lineHeight: '1.7',
          fontSize: '1.125rem',
          whiteSpace: 'pre-wrap'
        }}>
          {processedChildren}
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
    bullet: ({ children }: { children: React.ReactNode }) => (
      <li style={{ 
        margin: '0.5rem 0',
        lineHeight: '1.6'
      }}>
        {children}
      </li>
    ),
    number: ({ children }: { children: React.ReactNode }) => (
      <li style={{ 
        margin: '0.5rem 0',
        lineHeight: '1.6'
      }}>
        {children}
      </li>
    ),
  },
}

interface PortableTextProps {
  value: unknown
}

export default function PortableText({ value }: PortableTextProps) {
  return <BasePortableText value={value as never} components={components as never} />
}
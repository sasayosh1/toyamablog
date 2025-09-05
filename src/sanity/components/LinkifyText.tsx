'use client'

import React from 'react'

interface LinkifyTextProps {
  children: string
}

const LINK_REGEX = /(https?:\/\/(?:www\.)?[^\s]+|www\.[^\s]+)/g

export default function LinkifyText({ children }: LinkifyTextProps) {
  if (!children || typeof children !== 'string') {
    return <span>{children}</span>
  }

  const parts = children.split(LINK_REGEX)
  
  return (
    <span>
      {parts.map((part, index) => {
        if (LINK_REGEX.test(part)) {
          // www.で始まる場合はhttps://を自動追加
          const href = part.startsWith('www.') ? `https://${part}` : part
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              {part}
            </a>
          )
        }
        return part
      })}
    </span>
  )
}
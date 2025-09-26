import React from 'react'
import {EyeOpenIcon} from '@sanity/icons'

interface PreviewButtonProps {
  slug?: string
}

export function PreviewButton({ slug }: PreviewButtonProps) {
  const handleClick = () => {
    if (!slug) {
      alert('記事のスラッグが設定されていません。先にタイトルとスラッグを保存してください。')
      return
    }

    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3002'
      : 'https://sasakiyoshimasa.com'

    const previewUrl = `${baseUrl}/blog/${slug}`
    window.open(previewUrl, '_blank')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: '#2276fc',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      <EyeOpenIcon />
      プレビュー
    </button>
  )
}
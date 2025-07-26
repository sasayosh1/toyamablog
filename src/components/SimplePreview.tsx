'use client'

import { useEffect, useState } from 'react'

interface SimplePreviewProps {
  document: {
    displayed: {
      title?: string
      slug?: { current?: string }
      _id?: string
    }
  }
}

export default function SimplePreview({ document }: SimplePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    const doc = document.displayed
    if (doc?.slug?.current) {
      const baseUrl = window.location.origin
      setPreviewUrl(`${baseUrl}/blog/${doc.slug.current}?preview=true`)
    }
  }, [document])

  const doc = document.displayed

  if (!doc?.slug?.current) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>プレビューを表示するにはスラッグを設定してください</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '10px', 
        borderBottom: '1px solid #e1e3e9',
        background: '#f9f9f9' 
      }}>
        <strong>プレビュー: {doc.title || 'タイトルなし'}</strong>
      </div>
      <div style={{ flex: 1 }}>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Post Preview"
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%' 
          }}>
            <p>プレビューを読み込み中...</p>
          </div>
        )}
      </div>
    </div>
  )
}
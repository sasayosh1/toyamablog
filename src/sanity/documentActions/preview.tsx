import React from 'react'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

// シンプルなプレビューアクション
const PreviewAction: DocumentActionComponent = (props: DocumentActionProps) => {
  return {
    label: 'Preview',
    onHandle: () => {
      const doc = props.draft || props.published
      const slug =
        doc &&
        typeof doc === 'object' &&
        'slug' in doc &&
        typeof (doc as { slug?: { current?: unknown } }).slug?.current === 'string'
          ? (doc as { slug?: { current?: string } }).slug?.current
          : undefined

      if (!slug) {
        window.alert('プレビューURLを生成できません（slugが未設定）')
        props.onComplete()
        return
      }

      // ローカルでは dev サーバー、その他は本番を開く
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      const baseUrl = isLocalhost ? 'http://127.0.0.1:4000' : 'https://sasakiyoshimasa.com'

      const url = `${baseUrl}/blog/${slug}?preview=1`
      window.open(url, '_blank', 'noopener,noreferrer')
      props.onComplete()
    },
  }
}

export default PreviewAction

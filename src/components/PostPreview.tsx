'use client'

import { useEffect, useState } from 'react'
import { SanityDocument } from '@sanity/client'
import { Card, Flex, Text } from '@sanity/ui'

interface PostPreviewProps {
  document: {
    draft?: SanityDocument
    published?: SanityDocument
  }
}

export default function PostPreview({ document }: PostPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    const doc = document.draft || document.published
    if (doc?.slug?.current) {
      // プレビューURLを生成
      const baseUrl = window.location.origin.replace(':3001', ':3001') // 同じポートを使用
      setPreviewUrl(`${baseUrl}/blog/${doc.slug.current}?preview=true`)
    }
  }, [document])

  const doc = document.draft || document.published

  if (!doc) {
    return (
      <Card padding={4}>
        <Text>ドキュメントが見つかりません</Text>
      </Card>
    )
  }

  if (!doc.slug?.current) {
    return (
      <Card padding={4}>
        <Text>プレビューを表示するにはスラッグを設定してください</Text>
      </Card>
    )
  }

  return (
    <Card height="fill">
      <Flex direction="column" height="fill">
        <Card padding={3} style={{ borderBottom: '1px solid #e1e3e9' }}>
          <Flex align="center" justify="space-between">
            <Text weight="medium">プレビュー</Text>
            <Text size={1} muted>
              {doc.title || 'タイトルなし'}
            </Text>
          </Flex>
        </Card>
        <Card flex={1}>
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
            <Flex align="center" justify="center" height="fill">
              <Text>プレビューを読み込み中...</Text>
            </Flex>
          )}
        </Card>
      </Flex>
    </Card>
  )
}
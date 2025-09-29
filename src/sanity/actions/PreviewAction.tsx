import {EyeOpenIcon} from '@sanity/icons'
import { DocumentActionProps } from 'sanity'

export const PreviewAction = (props: DocumentActionProps) => {
  const {draft, published} = props
  const doc = draft || published

  if (!doc || doc._type !== 'post') {
    return null
  }

  const slug = doc.slug && typeof doc.slug === 'object' && 'current' in doc.slug ? doc.slug.current : undefined

  const handlePreview = () => {
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

  return {
    label: 'プレビュー',
    icon: EyeOpenIcon,
    onHandle: handlePreview,
    tone: 'primary' as const
  }
}
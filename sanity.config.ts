import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'
import {structure} from './src/sanity/structure'
import previewAction from './src/sanity/documentActions/preview'

export default defineConfig({
  name: 'sasakiyoshimasa-com',
  title: '富山、お好きですか？',

  projectId: 'aoxze287',
  dataset: 'production',

  plugins: [
    structureTool({structure}), 
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },

  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:4000',
      'https://sasakiyoshimasa.com',
      'https://sanity.io',
      'https://aoxze287.sanity.studio',
      'https://toyamablog.sanity.studio'
    ],
    credentials: false
  },


  document: {
    // 文書編集時のオプション
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((templateItem) => templateItem.templateId !== 'post-by-author')
      }
      return prev
    },
    // 記事編集時の表示制限を解除し、プレビューを追加
    actions: (prev, context) => {
      // post のみにプレビューアクションを追加
      if (context.schemaType === 'post') {
        return [previewAction, ...prev]
      }
      return prev
    },
  },
  
  // エディターの動作改善は省略
})

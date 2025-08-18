import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  name: 'default',
  title: '富山のくせに - AMAZING TOYAMA',

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
      'https://sasakiyoshimasa.com', 
      'https://sanity.io',
      'https://aoxze287.sanity.studio'
    ],
    credentials: true
  },

  studio: {
    components: {
      layout: (props) => {
        if (typeof window !== 'undefined') {
          document.cookie = 'SameSite=None; Secure'
        }
        return props.renderDefault(props)
      }
    }
  },

  document: {
    // 文書編集時のオプション
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter((templateItem) => templateItem.templateId !== 'post-by-author')
      }
      return prev
    },
    // 記事編集時の表示制限を解除
    actions: (prev, context) => {
      // デフォルトのアクションをすべて有効化
      return prev
    },
  }
})
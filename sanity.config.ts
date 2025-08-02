import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'TOYAMA BLOG',

  projectId: 'aoxze287',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  cors: {
    origin: ['http://localhost:3000', 'https://sasakiyoshimasa.com', 'https://sasakiyoshimasa.sanity.studio'],
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
  }
})
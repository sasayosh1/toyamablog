import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './src/sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'TOYAMA BLOG',

  projectId: 'aoxze287',
  dataset: 'production',

  plugins: [
    structureTool({
      structure,
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})

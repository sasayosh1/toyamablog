// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    sanity({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'aoxze287',
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      apiVersion: process.env.PUBLIC_SANITY_API_VERSION || '2024-01-01',
      // Sanity Studio を /studio で利用可能にする
      studioBasePath: '/studio'
    })
  ]
});

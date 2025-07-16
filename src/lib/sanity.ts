import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-07-15',
  useCdn: true,
})
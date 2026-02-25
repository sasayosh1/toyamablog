import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fieldsets: [
    {
      name: 'english',
      title: 'English Translation (Auto-generated)',
      options: { collapsible: true, collapsed: false }
    }
  ],
  fields: [
    // Japanese (Primary) Localized Fields
    defineField({
      name: 'title',
      title: 'Title (JA)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'titleEn',
      title: 'Title (EN)',
      type: 'string',
      fieldset: 'english',
    }),

    // Original Fields
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'titleEn', // Use English title for slug source ideally, or keep it 'title' if logic relies on it. Keep 'title' to not break existing
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),

    // Japanese Fields
    defineField({
      name: 'excerpt',
      title: 'Excerpt (JA)',
      type: 'text',
      rows: 4,
      description: 'Brief description of the post for preview and SEO',
    }),
    defineField({
      name: 'excerptEn',
      title: 'Excerpt (EN)',
      type: 'text',
      rows: 4,
      fieldset: 'english',
      description: 'English description for SEO and previews',
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'category',
      title: 'Primary Category',
      type: 'string',
      description: 'Main category for this post',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Associated YouTube video URL',
    }),

    // Japanese Body
    defineField({
      name: 'body',
      title: 'Body (JA)',
      type: 'blockContent',
      description: 'Main content of the post in Japanese',
    }),

    // English Body
    defineField({
      name: 'bodyEn',
      title: 'Body (EN)',
      type: 'blockContent',
      fieldset: 'english',
      description: 'Main content of the post in English',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      category: 'category',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { author, category, publishedAt } = selection
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('ja-JP') : ''
      return {
        ...selection,
        subtitle: `${category || 'No Category'} | ${author ? `by ${author}` : 'No Author'} | ${date}`
      }
    },
  },

  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [
        { field: 'publishedAt', direction: 'asc' }
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    },
  ],
})
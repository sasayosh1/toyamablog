import {defineField, defineType} from 'sanity'

export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      description: 'Hero section call-to-action button text',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA Link',
      type: 'string',
      description: 'Hero section call-to-action button URL',
    }),
    defineField({
      name: 'footerText',
      title: 'Footer Text',
      type: 'text',
      rows: 3,
      description: 'Primary footer description shown site-wide',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Home Page',
        subtitle: subtitle || 'Homepage copy',
      }
    },
  },
})

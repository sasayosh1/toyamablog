import {defineType, defineArrayMember} from 'sanity'

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'}
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
          {title: 'Underline', value: 'underline'},
          {title: 'Strike', value: 'strike-through'},
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
              {
                title: 'Open in new tab',
                name: 'blank',
                type: 'boolean'
              }
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessiblity.',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }
      ]
    }),
    defineArrayMember({
      type: 'object',
      name: 'html',
      title: 'HTML Embed',
      fields: [
        {
          name: 'html',
          type: 'text',
          title: 'HTML Code',
          description: 'Embed HTML code (use with caution)',
        }
      ]
    }),
    defineArrayMember({
      type: 'object',
      name: 'youtube',
      title: 'YouTube Video',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'YouTube URL',
          validation: (Rule) => Rule.required(),
        }
      ],
      preview: {
        select: {
          url: 'url'
        },
        prepare(selection) {
          const {url} = selection
          return {
            title: 'YouTube Video',
            subtitle: url
          }
        }
      }
    }),
  ],
})
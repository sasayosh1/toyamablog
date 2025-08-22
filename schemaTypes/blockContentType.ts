import {defineType, defineArrayMember} from 'sanity'

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  // エディターのオプション設定
  options: {
    // インサートメニューの設定
    insertMenu: {
      // よく使う要素を上位に表示
      groups: [
        {
          name: 'content',
          title: 'コンテンツ',
          of: ['block', 'image']
        },
        {
          name: 'media',
          title: 'メディア',
          of: ['youtube', 'html', 'googleMaps']
        }
      ]
    },
    // エディター内でのフォーカス改善
    layout: 'default'
  },
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
      title: '🔗 HTML・iframe埋め込み',
      icon: () => '🔗',
      fields: [
        {
          name: 'html',
          type: 'text',
          title: 'HTML Code',
          description: 'Google Maps iframe、その他のHTML埋め込みコード用（例: <iframe src="..." width="100%" height="300" ...></iframe>）',
          rows: 8,
          validation: (Rule) => Rule.required()
        }
      ],
      preview: {
        select: {
          html: 'html'
        },
        prepare(selection) {
          const {html} = selection
          const isGoogleMaps = html?.includes('maps/embed') || html?.includes('google.com/maps')
          const isYouTube = html?.includes('youtube.com/embed') || html?.includes('youtu.be')
          
          let title = 'HTML埋め込み'
          if (isGoogleMaps) {
            title = '🗺️ Googleマップ'
          } else if (isYouTube) {
            title = '📺 YouTube動画'
          }
          
          // HTMLコードの最初の50文字をサブタイトルに
          const subtitle = html ? html.substring(0, 50) + '...' : 'HTMLコードなし'
          
          return {
            title: title,
            subtitle: subtitle
          }
        }
      }
    }),
    defineArrayMember({
      type: 'object',
      name: 'googleMaps',
      title: '🗺️ Googleマップ',
      icon: () => '🗺️',
      fields: [
        {
          name: 'iframe',
          type: 'text',
          title: 'Google Maps iframe',
          description: 'Google Mapsの「共有」→「地図を埋め込む」で取得したiframeコードをそのまま貼り付けてください',
          rows: 6,
          placeholder: '<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
          validation: (Rule) => 
            Rule.required()
              .custom((iframe) => {
                if (!iframe) return '地図のiframeコードが必要です'
                if (!iframe.includes('google.com/maps/embed')) {
                  return 'Google Mapsの埋め込みコードを入力してください'
                }
                return true
              })
        },
        {
          name: 'description',
          type: 'string',
          title: '説明（オプション）',
          description: '地図の説明文（例: 施設名や住所）',
          placeholder: '例: 富山駅から徒歩5分の便利な立地'
        }
      ],
      preview: {
        select: {
          iframe: 'iframe',
          description: 'description'
        },
        prepare(selection) {
          const {iframe, description} = selection
          
          // iframe内から施設名を抽出しようとする
          let locationName = '場所名不明'
          if (iframe) {
            // URLデコードして日本語の施設名を抽出
            try {
              const decodedUrl = decodeURIComponent(iframe)
              const match = decodedUrl.match(/2s([^!]+)!/)
              if (match && match[1]) {
                locationName = match[1].replace(/\+/g, ' ')
              }
            } catch (e) {
              // デコードに失敗した場合はデフォルト値のまま
            }
          }
          
          return {
            title: `🗺️ ${locationName}`,
            subtitle: description || 'Googleマップ'
          }
        }
      }
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
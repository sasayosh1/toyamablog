import { Post } from './sanity'

// 組織の構造化データ（サイト全体用）
export function generateOrganizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '富山、お好きですか？',
    alternateName: 'AMAZING TOYAMA',
    url: 'https://sasakiyoshimasa.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://sasakiyoshimasa.com/images/logo.png',
      width: 400,
      height: 400
    },
    sameAs: [
      'https://twitter.com/sasayoshi_tym',
      'https://www.youtube.com/@sasayoshi_tym'
    ],
    address: {
      '@type': 'PostalAddress',
      addressRegion: '富山県',
      addressCountry: 'JP'
    },
    description: '富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ。もっと富山を好きになる視点をお届けします。'
  }
}

// WebSiteの構造化データ（検索機能付き）
export function generateWebSiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '富山、お好きですか？',
    alternateName: 'AMAZING TOYAMA',
    url: 'https://sasakiyoshimasa.com',
    description: '富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ',
    inLanguage: 'ja-JP',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://sasakiyoshimasa.com/?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: '富山、お好きですか？',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sasakiyoshimasa.com/images/logo.png'
      }
    }
  }
}

// 記事の構造化データ
export function generateArticleLD(post: Post, slug: string) {
  // YouTube動画IDを抽出
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null
    
    // youtu.be形式
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0] || null
    }
    
    // youtube.com/watch形式
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0] || null
    }
    
    // youtube.com/shorts形式
    if (url.includes('youtube.com/shorts/')) {
      return url.split('shorts/')[1]?.split('?')[0] || null
    }
    
    return null
  }

  const videoId = post.youtubeUrl ? getYouTubeVideoId(post.youtubeUrl) : null
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : post.thumbnail?.asset?.url || 'https://sasakiyoshimasa.com/images/og-image.png'

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.description || `${post.title}の詳細情報を紹介しています。`,
    image: {
      '@type': 'ImageObject',
      url: thumbnailUrl,
      width: 1200,
      height: 630
    },
    author: {
      '@type': 'Person',
      name: post.author?.name || 'ささよし',
      url: 'https://sasakiyoshimasa.com/about'
    },
    publisher: {
      '@type': 'Organization',
      name: '富山、お好きですか？',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sasakiyoshimasa.com/images/logo.png',
        width: 400,
        height: 400
      }
    },
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://sasakiyoshimasa.com/blog/${slug}`
    },
    url: `https://sasakiyoshimasa.com/blog/${slug}`,
    inLanguage: 'ja-JP',
    isPartOf: {
      '@type': 'WebSite',
      name: '富山、お好きですか？',
      url: 'https://sasakiyoshimasa.com'
    }
  }

  // カテゴリーがある場合は追加
  if (post.category) {
    structuredData.articleSection = post.category
    structuredData.about = {
      '@type': 'Thing',
      name: post.category
    }
  }

  // タグがある場合は追加
  if (post.tags && post.tags.length > 0) {
    structuredData.keywords = post.tags.join(', ')
  }

  // YouTube動画がある場合はVideoObject追加
  if (post.youtubeUrl && videoId) {
    const youtubeWatchUrl = post.youtubeUrl.startsWith('http')
      ? post.youtubeUrl
      : `https://www.youtube.com/watch?v=${videoId}`

    const thumbnails = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    ]

    structuredData.video = {
      '@type': 'VideoObject',
      name: post.title,
      description: post.excerpt || post.description || `${post.title}の動画です。`,
      thumbnailUrl: thumbnails,
      contentUrl: youtubeWatchUrl,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      uploadDate: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
      inLanguage: 'ja',
      publisher: {
        '@type': 'Organization',
        name: '富山、お好きですか？',
        logo: {
          '@type': 'ImageObject',
          url: 'https://sasakiyoshimasa.com/images/og-image.png',
          width: 1200,
          height: 630
        }
      },
      potentialAction: {
        '@type': 'WatchAction',
        target: youtubeWatchUrl
      }
    }
  }

  return structuredData
}

// パンくずナビゲーションの構造化データ
export function generateBreadcrumbLD(items: Array<{ name: string; url?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url })
    }))
  }
}

// カテゴリーページの構造化データ
export function generateCategoryLD(categoryName: string, posts: Post[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName}の記事一覧`,
    description: `富山県${categoryName}に関する記事をまとめています。`,
    url: `https://sasakiyoshimasa.com/category/${encodeURIComponent(categoryName)}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://sasakiyoshimasa.com/blog/${post.slug.current}`
      }))
    },
    isPartOf: {
      '@type': 'WebSite',
      name: '富山、お好きですか？',
      url: 'https://sasakiyoshimasa.com'
    }
  }
}

// タグページの構造化データ
export function generateTagLD(tagName: string, posts: Post[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${tagName}に関する記事一覧`,
    description: `${tagName}に関する富山県の情報をまとめています。`,
    url: `https://sasakiyoshimasa.com/tag/${encodeURIComponent(tagName)}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://sasakiyoshimasa.com/blog/${post.slug.current}`
      }))
    },
    isPartOf: {
      '@type': 'WebSite',
      name: '富山、お好きですか？',
      url: 'https://sasakiyoshimasa.com'
    }
  }
}

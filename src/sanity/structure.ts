import type {StructureResolver} from 'sanity/structure'

const mergeMenuItems = (items: any[]) => {
  const seen = new Set<string>()
  const merged: any[] = []

  items.forEach((item) => {
    if (!item) return
    const id = typeof item.getId === 'function' ? item.getId() : undefined
    if (id && seen.has(id)) return
    if (id) seen.add(id)
    merged.push(item)
  })

  return merged
}

const createPostListFactory = (S: any) => {
  const basePostList = S.documentTypeList('post')
  const defaultMenuItems = basePostList.getMenuItems() || []

  const orderingMenuItems = [
    S.orderingMenuItem(
      S.ordering()
        .title('Sort by Publish date (new→old)')
        .id('publishedAtDesc')
        .by([{field: 'publishedAt', direction: 'desc'}])
    ),
    S.orderingMenuItem(
      S.ordering()
        .title('Sort by Title (A→Z)')
        .id('titleAsc')
        .by([{field: 'title', direction: 'asc'}])
    ),
    S.orderingMenuItem(
      S.ordering()
        .title('Sort by Last Edited')
        .id('updatedAtDesc')
        .by([{field: '_updatedAt', direction: 'desc'}])
    ),
    S.orderingMenuItem(
      S.ordering()
        .title('Sort by Created')
        .id('createdAtDesc')
        .by([{field: '_createdAt', direction: 'desc'}])
    ),
  ]

  const postMenuItems = mergeMenuItems([...defaultMenuItems, ...orderingMenuItems])
  const initialTemplates = basePostList.getInitialValueTemplates()
  const canHandleIntent = basePostList.getCanHandleIntent()

  return (title: string, filter?: string) => {
    let listBuilder = S.documentTypeList('post')
      .title(title)
      .menuItems(postMenuItems)
      .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])

    if (initialTemplates) {
      listBuilder = listBuilder.initialValueTemplates(initialTemplates)
    }

    if (typeof canHandleIntent === 'function') {
      listBuilder = listBuilder.canHandleIntent(canHandleIntent)
    }

    if (filter) {
      listBuilder = listBuilder.filter(filter)
    }

    return listBuilder
  }
}

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) => {
  const createPostList = createPostListFactory(S)

  return S.list()
    .title('Content')
    .items([
      // Posts section
      S.listItem()
        .title('📝 Posts')
        .child(createPostList('All Posts')),

      // Published Posts
      S.listItem()
        .title('✅ Published Posts')
        .child(createPostList('Published Posts', '_type == "post" && defined(publishedAt)')),

      // Draft Posts
      S.listItem()
        .title('📄 Draft Posts')
        .child(createPostList('Draft Posts', '_type == "post" && !defined(publishedAt)')),

      // Posts with YouTube
      S.listItem()
        .title('📺 YouTube Posts')
        .child(createPostList('Posts with YouTube Videos', '_type == "post" && defined(youtubeUrl)')),

      // Categories section
      S.listItem()
        .title('📂 Categories')
        .child(
          S.documentList()
            .title('Categories')
            .filter('_type == "category"')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),

      // Authors section
      S.listItem()
        .title('👤 Authors')
        .child(
          S.documentList()
            .title('Authors')
            .filter('_type == "author"')
            .defaultOrdering([{field: 'name', direction: 'asc'}])
        ),

      // Maintenance section
      S.listItem()
        .title('🔧 Maintenance')
        .child(
          S.list()
            .title('Content Maintenance')
            .items([
              S.listItem()
                .title('Missing Excerpts')
                .child(
                  createPostList(
                    'Posts without Excerpts',
                    '_type == "post" && (!defined(excerpt) || excerpt == "")'
                  )
                ),
              S.listItem()
                .title('Missing Images')
                .child(
                  createPostList(
                    'Posts without Main Images',
                    '_type == "post" && !defined(mainImage)'
                  )
                ),
            ])
        ),
    ])
}

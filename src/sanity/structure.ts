import type {StructureResolver} from 'sanity/structure'

const customOrderings = [
  {
    title: 'Sort by Publish date (new→old)',
    name: 'publishedAtDesc',
    by: [{field: 'publishedAt', direction: 'desc'}],
  },
  {
    title: 'Sort by Title (A→Z)',
    name: 'titleAsc',
    by: [{field: 'title', direction: 'asc'}],
  },
  {
    title: 'Sort by Last Edited',
    name: 'updatedAtDesc',
    by: [{field: '_updatedAt', direction: 'desc'}],
  },
  {
    title: 'Sort by Created',
    name: 'createdAtDesc',
    by: [{field: '_createdAt', direction: 'desc'}],
  },
]

const createPostList = (S: any, title: string, filter?: string) => {
  const basePostList = S.documentTypeList('post')
  const defaultMenuItems = basePostList.getMenuItems?.() ?? []
  const initialTemplates = basePostList.getInitialValueTemplates?.()
  const canHandleIntent = basePostList.getCanHandleIntent?.()

  let listBuilder = S.documentTypeList('post')
    .title(title)
    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
    .menuItems([
      ...defaultMenuItems,
      ...customOrderings.map((ordering) => S.orderingMenuItem(ordering)),
    ])

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

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) => {
  const buildPostList = (title: string, filter?: string) => createPostList(S, title, filter)

  return S.list()
    .title('Content')
    .items([
      // Posts section
      S.listItem()
        .title('📝 Posts')
        .child(buildPostList('All Posts')),

      // Published Posts
      S.listItem()
        .title('✅ Published Posts')
        .child(buildPostList('Published Posts', '_type == "post" && defined(publishedAt)')),

      // Draft Posts
      S.listItem()
        .title('📄 Draft Posts')
        .child(buildPostList('Draft Posts', '_type == "post" && !defined(publishedAt)')),

      // Posts with YouTube
      S.listItem()
        .title('📺 YouTube Posts')
        .child(buildPostList('Posts with YouTube Videos', '_type == "post" && defined(youtubeUrl)')),

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
                  buildPostList(
                    'Posts without Excerpts',
                    '_type == "post" && (!defined(excerpt) || excerpt == "")'
                  )
                ),
              S.listItem()
                .title('Missing Images')
                .child(
                  buildPostList(
                    'Posts without Main Images',
                    '_type == "post" && !defined(mainImage)'
                  )
                ),
            ])
        ),
    ])
}

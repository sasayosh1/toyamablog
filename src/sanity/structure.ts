import type {StructureResolver, StructureBuilder} from 'sanity/structure'

const customOrderings = [
  {
    title: 'Sort by Publish date (new→old)',
    name: 'publishedAtDesc',
    by: [{field: 'publishedAt', direction: 'desc' as const}],
  },
  {
    title: 'Sort by Title (A→Z)',
    name: 'titleAsc',
    by: [{field: 'title', direction: 'asc' as const}],
  },
  {
    title: 'Sort by Last Edited',
    name: 'updatedAtDesc',
    by: [{field: '_updatedAt', direction: 'desc' as const}],
  },
  {
    title: 'Sort by Created',
    name: 'createdAtDesc',
    by: [{field: '_createdAt', direction: 'desc' as const}],
  },
]

const createPostList = (S: StructureBuilder, title: string, filter?: string) => {
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
      S.listItem().title('📝 Posts').child(buildPostList('All Posts')),
      S.listItem()
        .title('📂 Categories')
        .child(
          S.documentList()
            .title('Categories')
            .filter('_type == "category"')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),
      S.listItem()
        .title('👤 Authors')
        .child(
          S.documentList()
            .title('Authors')
            .filter('_type == "author"')
            .defaultOrdering([{field: 'name', direction: 'asc'}])
        ),
    ])
}

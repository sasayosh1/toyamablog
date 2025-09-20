import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Authors section
      S.listItem()
        .title('Author')
        .child(
          S.documentList()
            .title('Authors')
            .filter('_type == "author"')
            .defaultOrdering([{field: 'name', direction: 'asc'}])
        ),

      // Categories section
      S.listItem()
        .title('Category')
        .child(
          S.documentList()
            .title('Categories')
            .filter('_type == "category"')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),

      // Posts section
      S.listItem()
        .title('Post')
        .child(
          S.documentList()
            .title('All Posts')
            .filter('_type == "post"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),
    ])

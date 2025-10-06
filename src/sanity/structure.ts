import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Posts section
      S.listItem()
        .title('Posts')
        .child(
          S.documentList()
            .title('Posts')
            .filter('_type == "post"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),

      // Categories section
      S.listItem()
        .title('Categories')
        .child(
          S.documentList()
            .title('Categories')
            .filter('_type == "category"')
            .defaultOrdering([{field: 'title', direction: 'asc'}])
        ),

      // Authors section
      S.listItem()
        .title('Authors')
        .child(
          S.documentList()
            .title('Authors')
            .filter('_type == "author"')
            .defaultOrdering([{field: 'name', direction: 'asc'}])
        ),
    ])

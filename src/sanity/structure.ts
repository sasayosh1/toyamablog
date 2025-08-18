import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Posts section
      S.listItem()
        .title('📝 Posts')
        .child(
          S.documentList()
            .title('All Posts')
            .filter('_type == "post"')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),

      // Published Posts
      S.listItem()
        .title('✅ Published Posts')
        .child(
          S.documentList()
            .title('Published Posts')
            .filter('_type == "post" && defined(publishedAt)')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),

      // Draft Posts
      S.listItem()
        .title('📄 Draft Posts')
        .child(
          S.documentList()
            .title('Draft Posts')
            .filter('_type == "post" && !defined(publishedAt)')
            .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
        ),

      // Posts with YouTube
      S.listItem()
        .title('📺 YouTube Posts')
        .child(
          S.documentList()
            .title('Posts with YouTube Videos')
            .filter('_type == "post" && defined(youtubeUrl)')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
        ),

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
                  S.documentList()
                    .title('Posts without Excerpts')
                    .filter('_type == "post" && (!defined(excerpt) || excerpt == "")')
                    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                ),
              S.listItem()
                .title('Missing Images')
                .child(
                  S.documentList()
                    .title('Posts without Main Images')
                    .filter('_type == "post" && !defined(mainImage)')
                    .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                ),
            ])
        ),
    ])

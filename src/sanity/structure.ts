import type {StructureResolver} from 'sanity/structure'
import SimplePreview from '../components/SimplePreview'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('post')
        .title('Posts')
        .child(
          S.documentTypeList('post')
            .title('Posts')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('post')
                .views([
                  S.view.form(),
                  S.view
                    .component(SimplePreview)
                    .title('Preview')
                ])
            )
        ),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
    ])

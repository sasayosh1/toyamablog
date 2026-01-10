import { getPost } from '@/lib/sanity'
import { generateArticleLD, generateBreadcrumbLD } from '@/lib/structured-data'

export default async function Head({ params }: { params: { slug: string } }) {
  const { slug } = params
  const post = await getPost(slug)

  if (!post) return null

  const articleLD = generateArticleLD(post, slug)
  const breadcrumbLD = generateBreadcrumbLD([
    { name: 'ホーム', url: 'https://sasakiyoshimasa.com/' },
    ...(post.category ? [{ name: post.category, url: `https://sasakiyoshimasa.com/category/${encodeURIComponent(post.category)}` }] : []),
    { name: post.title.replace(/\s*#shorts\s*/gi, '').trim() }
  ])

  const jsonLd = JSON.stringify([articleLD, breadcrumbLD])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </>
  )
}

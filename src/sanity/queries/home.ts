export type HomePage = {
  title: string | null
  subtitle: string | null
  ctaLabel: string | null
  ctaHref: string | null
  footerText: string | null
}

export const homePageQuery = `
  *[_type == "homePage"][0]{
    title,
    subtitle,
    ctaLabel,
    ctaHref,
    footerText
  }
`

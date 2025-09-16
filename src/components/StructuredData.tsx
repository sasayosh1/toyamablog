interface StructuredDataProps {
  data: object | object[]
}

export default function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data)
    ? data.map(item => JSON.stringify(item)).join('\n')
    : JSON.stringify(data)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLd
      }}
      suppressHydrationWarning={true}
    />
  )
}
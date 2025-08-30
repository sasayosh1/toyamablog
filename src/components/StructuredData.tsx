import Script from 'next/script'

interface StructuredDataProps {
  data: object | object[]
}

export default function StructuredData({ data }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) 
    ? data.map(item => JSON.stringify(item)).join('\n')
    : JSON.stringify(data)

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: jsonLd
      }}
    />
  )
}
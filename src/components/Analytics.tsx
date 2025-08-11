'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void
    dataLayer: unknown[]
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return

    // Send page view on route change
    const url = 'https://sasakiyoshimasa.com' + pathname + (searchParams?.toString() ? '?' + searchParams.toString() : '')
    
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title,
    })

    // Explicitly send page_view event
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: document.title,
    })
  }, [pathname, searchParams])

  // Don't render anything if no measurement ID
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics measurement ID not found')
    return null
  }

  return (
    <>
      {/* Load gtag script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      
      {/* Initialize gtag */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              page_title: document.title,
              send_page_view: false
            });
            
            // Send initial page view
            gtag('event', 'page_view', {
              page_location: window.location.href,
              page_title: document.title,
            });
          `,
        }}
      />
    </>
  )
}
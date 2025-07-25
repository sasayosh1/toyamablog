'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    // Load gtag script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: 'https://sasakiyoshimasa.com' + pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''),
      send_page_view: false // We'll send manually
    })

    // Send initial page view
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: 'https://sasakiyoshimasa.com' + pathname + (searchParams.toString() ? '?' + searchParams.toString() : ''),
    })
  }, [])

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return

    // Send page view on route change
    const url = 'https://sasakiyoshimasa.com' + pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')
    
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: url,
    })
  }, [pathname, searchParams])

  return null
}
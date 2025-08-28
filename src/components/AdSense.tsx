'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ''

export function AdSense() {
  useEffect(() => {
    // AdSense auto ads initialization
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle && ADSENSE_PUBLISHER_ID) {
        (window.adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: ADSENSE_PUBLISHER_ID,
          enable_page_level_ads: true
        })
      }
    } catch (error) {
      console.error('AdSense auto ads initialization error:', error)
    }
  }, [])

  // Don't render if no publisher ID
  if (!ADSENSE_PUBLISHER_ID) {
    if (typeof window !== 'undefined') {
      console.warn('AdSense publisher ID not found')
    }
    return null
  }

  return (
    <>
      <Script
        id="adsense-script"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <Script
        id="adsense-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.adsbygoogle = window.adsbygoogle || [];
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "${ADSENSE_PUBLISHER_ID}",
              enable_page_level_ads: true
            });
          `
        }}
      />
    </>
  )
}

interface AdUnitProps {
  slot: string
  format?: string
  responsive?: boolean
  className?: string
}

export function AdUnit({ slot, format = 'auto', responsive = true, className = '' }: AdUnitProps) {
  useEffect(() => {
    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        }
      } catch (error) {
        console.error('AdSense ad unit initialization error:', error)
      }
    }

    // Delay ad loading to ensure AdSense script is loaded
    const timer = setTimeout(loadAd, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (!ADSENSE_PUBLISHER_ID) {
    return null
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
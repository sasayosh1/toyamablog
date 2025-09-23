'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const rawPublisherId = (process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '').trim()

// Google AdSense の publisher ID は『ca-pub-xxxxxxxx』形式である必要がある。
// Vercel の環境変数に `pub-xxxxxxxx` だけが入っているケースがあったため、
// ここで正しいフォーマットに正規化してから利用する。
const ADSENSE_PUBLISHER_ID = rawPublisherId.startsWith('ca-pub-')
  ? rawPublisherId
  : rawPublisherId.startsWith('pub-')
    ? `ca-${rawPublisherId}`
    : rawPublisherId

export const NORMALIZED_ADSENSE_PUBLISHER_ID = ADSENSE_PUBLISHER_ID

export function AdSense() {
  useEffect(() => {
    // AdSense auto ads initialization
    if (typeof window === 'undefined' || !ADSENSE_PUBLISHER_ID) {
      return
    }

    try {
      window.adsbygoogle = window.adsbygoogle || []

      // Auto ads の新しい推奨設定では、空オブジェクトを push するだけで OK。
      // 既存コードとの互換性を保ちつつ、念のためクライアント ID も渡す。
      ;(window.adsbygoogle as unknown[]).push({
        google_ad_client: ADSENSE_PUBLISHER_ID,
        enable_page_level_ads: true,
      })
    } catch (error) {
      console.error('AdSense auto ads initialization error:', error)
    }
  }, []);

  // Don't render AdSense in development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: AdSense script disabled');
    return null;
  }

  // Don't render if no publisher ID
  if (!ADSENSE_PUBLISHER_ID) {
    console.log('AdSense publisher ID not found');
    return null;
  }

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('AdSense script loaded successfully');
      }}
      onError={(error) => {
        console.warn('AdSense script loading error:', error);
      }}
    />
  );
}

interface AdUnitProps {
  slot: string
  format?: string
  responsive?: boolean
  className?: string
}

export function AdUnit({ slot, format = 'auto', responsive = true, className = '' }: AdUnitProps) {
  useEffect(() => {
    // Don't load ads in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }

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

  // Don't render ads in development
  if (process.env.NODE_ENV === 'development' || !ADSENSE_PUBLISHER_ID) {
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

'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { event as gtagEvent } from '@/lib/gtag'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// Hardcoded Publisher ID to avoid Vercel environment variable issues
const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-9743843249239449'

function sessionKey(key: string) {
  return `toyamablog:${key}`
}

function hasSessionFlag(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(sessionKey(key)) === '1'
  } catch {
    return false
  }
}

function setSessionFlag(key: string) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(sessionKey(key), '1')
  } catch {
    // ignore
  }
}

function trackOncePerSession(action: string, key?: string, params?: Record<string, unknown>) {
  const flagKey = key || `event:${action}`
  if (hasSessionFlag(flagKey)) return

  let attempts = 0
  const maxAttempts = 15 // ~3s

  const tick = () => {
    attempts += 1
    try {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        gtagEvent({ action, params })
        setSessionFlag(flagKey)
        return
      }
    } catch {
      // ignore
    }
    if (attempts < maxAttempts) window.setTimeout(tick, 200)
  }

  tick()
}

export function AdSense() {
  useEffect(() => {
    if (!ADSENSE_PUBLISHER_ID) return

    // Detect likely AdBlock / blocked script (lightweight)
    const timer = window.setTimeout(() => {
      const hasAdsbygoogle = typeof window !== 'undefined' && !!window.adsbygoogle
      if (hasAdsbygoogle) return

      // "Bait" element technique: some blockers hide common ad classnames.
      const bait = document.createElement('div')
      bait.className = 'adsbox adsbygoogle'
      bait.style.position = 'absolute'
      bait.style.left = '-9999px'
      bait.style.width = '1px'
      bait.style.height = '1px'
      document.body.appendChild(bait)

      window.setTimeout(() => {
        const blocked = bait.offsetHeight === 0
        bait.remove()
        if (blocked) {
          trackOncePerSession('adblock_detected', 'adblock_detected')
        }
        if (!blocked) {
          trackOncePerSession('adsense_script_unavailable', 'adsense_script_unavailable')
        }
      }, 0)
    }, 3500)

    return () => window.clearTimeout(timer)
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
        onLoad={() => {
          trackOncePerSession('adsense_script_loaded', 'adsense_script_loaded')
        }}
        onError={() => {
          trackOncePerSession('adsense_script_error', 'adsense_script_error')
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
    if (!ADSENSE_PUBLISHER_ID) return
    if (!/^\d+$/.test(slot)) return

    let cancelled = false
    let attempts = 0

    const tryLoad = () => {
      if (cancelled) return
      attempts += 1

      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          ;(window.adsbygoogle = window.adsbygoogle || []).push({})
          return
        }
      } catch {
        // ignore
      }

      if (attempts < 20) {
        window.setTimeout(tryLoad, 250)
      } else {
        trackOncePerSession('adsense_adunit_timeout', `adunit_timeout:${slot}`)
      }
    }

    window.setTimeout(tryLoad, 0)
    return () => {
      cancelled = true
    }
  }, [slot])

  if (!ADSENSE_PUBLISHER_ID || !/^\d+$/.test(slot)) {
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

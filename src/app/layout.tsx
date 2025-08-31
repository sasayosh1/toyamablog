import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GAProvider from "./ga-provider";
import { AdSense } from "@/components/AdSense";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "富山のくせに - AMAZING TOYAMA",
    template: '%s | 富山のくせに'
  },
  description: "富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ。地元の魅力を発信し「富山のくせになかなかええやん！」をお届けします。",
  keywords: ["富山", "富山県", "観光", "グルメ", "YouTube Shorts", "旅行", "地域情報", "北陸", "立山連峰", "日本海"],
  authors: [{ name: "ささよし", url: "https://sasakiyoshimasa.com" }],
  creator: "ささよし",
  publisher: "富山のくせに",
  metadataBase: new URL('https://sasakiyoshimasa.com'),
  alternates: {
    canonical: 'https://sasakiyoshimasa.com',
  },
  openGraph: {
    title: "富山のくせに - AMAZING TOYAMA",
    description: "富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ。",
    url: 'https://sasakiyoshimasa.com',
    siteName: '富山のくせに',
    images: [{
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
      alt: '富山のくせに - AMAZING TOYAMA サイトイメージ'
    }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "富山のくせに - AMAZING TOYAMA",
    description: "富山県の観光スポット、グルメ情報、文化を紹介するYouTube Shorts連携ブログ。",
    site: '@sasayoshi_tym',
    creator: '@sasayoshi_tym',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "NocI3MMwDMlZ9xW66Er1NNBu4KIfUhL71SWYQpGysfE",
  },
  category: '旅行・観光',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="富山のくせに" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="富山のくせに" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Suspense fallback={null}>
            <GAProvider />
            <AdSense />
          </Suspense>
          {children}
          <Footer />
          <ScrollToTop />
        </ErrorBoundary>
      </body>
    </html>
  );
}

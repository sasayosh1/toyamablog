import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import GAProvider from "@/app/ga-provider";
import { AdSense } from "@/components/AdSense";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
export const metadata: Metadata = {
  title: {
    default: "Do you like Toyama? - AMAZING TOYAMA",
    template: '%s | Do you like Toyama?'
  },
  description: "A YouTube Shorts linked blog discovering the sightseeing spots, gourmet, and culture of Toyama Prefecture. Delivering a perspective that will make you love Toyama even more.",
  keywords: ["Toyama", "Toyama Prefecture", "Sightseeing", "Gourmet", "YouTube Shorts", "Travel", "Local Info", "Hokuriku", "Tateyama Mountain Range", "Sea of Japan"],
  authors: [{ name: "Sasayoshi", url: "https://sasakiyoshimasa.com/en" }],
  creator: "Sasayoshi",
  publisher: "Do you like Toyama?",
  metadataBase: new URL('https://sasakiyoshimasa.com'),
  alternates: {
    canonical: 'https://sasakiyoshimasa.com/en',
    languages: {
      'ja': 'https://sasakiyoshimasa.com',
      'en': 'https://sasakiyoshimasa.com/en',
    },
  },
  openGraph: {
    title: "Do you like Toyama? - AMAZING TOYAMA",
    description: "A YouTube Shorts linked blog discovering the sightseeing spots, gourmet, and culture of Toyama. Delivering hints to make you love Toyama more.",
    url: 'https://sasakiyoshimasa.com/en',
    siteName: 'Do you like Toyama?',
    images: [{
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Do you like Toyama? - AMAZING TOYAMA Site Image'
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Do you like Toyama? - AMAZING TOYAMA",
    description: "A YouTube Shorts linked blog introducing sightseeing spots, gourmet info, and culture of Toyama.",
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
    google: [
      "NocI3MMwDMlZ9xW66Er1NNBu4KIfUhL71SWYQpGysfE",
      "omvaUk6hn7En2E4kT7Mfh4KGei3LByhGEe_PpZKbJug",
    ],
  },
  category: 'Travel & Sightseeing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="Do you like Toyama?" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Do you like Toyama?" />
      </head>
      <body
        className={`antialiased`}
      >
        <ErrorBoundary>
          {children}
          <Suspense fallback={null}>
            <GAProvider />
            <AdSense />
          </Suspense>
          <Footer locale="en" basePath="/en" />
          <ScrollToTop locale="en" />
        </ErrorBoundary>
      </body>
    </html>
  );
}

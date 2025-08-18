import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GAProvider from "./ga-provider";
import { AdSense } from "@/components/AdSense";
import Footer from "@/components/Footer";
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
  title: "富山のくせに - AMAZING TOYAMA",
  description: "富山の魅力を発信するブログ「富山のくせに」- AMAZING TOYAMA。地元グルメ、観光スポット、文化イベントなど富山の「くせに」すごい魅力をお届けします。",
  metadataBase: new URL('https://sasakiyoshimasa.com'),
  alternates: {
    canonical: 'https://sasakiyoshimasa.com',
  },
  openGraph: {
    title: "富山のくせに - AMAZING TOYAMA",
    description: "富山の魅力を発信するブログ「富山のくせに」- AMAZING TOYAMA。地元グルメ、観光スポット、文化イベントなど富山の「くせに」すごい魅力をお届けします。",
    url: 'https://sasakiyoshimasa.com',
    siteName: '富山のくせに',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "富山のくせに - AMAZING TOYAMA",
    description: "富山の魅力を発信するブログ「富山のくせに」- AMAZING TOYAMA。地元グルメ、観光スポット、文化イベントなど富山の「くせに」すごい魅力をお届けします。",
  },
  verification: {
    google: "NocI3MMwDMlZ9xW66Er1NNBu4KIfUhL71SWYQpGysfE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <GAProvider />
          <AdSense />
        </Suspense>
        {children}
        <Footer />
      </body>
    </html>
  );
}
